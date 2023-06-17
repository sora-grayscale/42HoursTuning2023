
import express from "express";
import { MatchGroupConfig } from "../../model/types";
import { checkSkillsRegistered, createMatchGroup } from "./usecase";
import { getUserByUserId } from "../users/repository";
import {
  getMatchGroupIdsByUserId,
  getMatchGroupsByMatchGroupIds,
} from "./repository";

export const matchGroupRouter = express.Router();

// マッチグループ作成API
matchGroupRouter.post(
  "/",
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (!isReqBodyTypeCorrect(req, res)) {
      return;
    }
    try {
      const reqBody: MatchGroupConfig = {
        ownerId: req.headers["X-DA-USER-ID"] as string,
        matchGroupName: req.body.matchGroupName,
        description: req.body.description,
        numOfMembers: req.body.numOfMembers,
        departmentFilter: req.body.departmentFilter,
        officeFilter: req.body.officeFilter,
        skillFilter: req.body.skillFilter,
        neverMatchedFilter: req.body.neverMatchedFilter,
      };
      if (!(await isReqBodyValueCorrect(reqBody, res))) {
        return;
      }
      console.log("specified condition is valid");

      const matchGroupDetail = await createMatchGroup(reqBody);
      if (!matchGroupDetail) {
        res.status(500).json({
          message: "マッチグループの作成に失敗しました。",
        });
        console.error("failed to create a new match group");
        return;
      }
      res.status(201).json(matchGroupDetail);
      console.log("successfully created a new match group");
    } catch (e) {
      next(e);
    }
  }
);

const isReqBodyTypeCorrect = (
  req: express.Request,
  res: express.Response
): boolean => {
  if (
    typeof req.body.matchGroupName !== "string" ||
    req.body.matchGroupName.length < 1 ||
    50 < req.body.matchGroupName.length
  ) {
    res.status(400).json({
      message: "マッチグループ名を1文字以上50文字以下の文字列で指定してください。",
    });
    console.warn("matchGroupName is not specified or not valid");
    return false;
  }
  if (
    typeof req.body.description !== "string" ||
    120 < req.body.description.length
  ) {
    res.status(400).json({
      message: "マッチグループの説明を120文字以下の文字列で指定してください。",
    });
    console.warn("description is not specified or not valid");
    return false;
  }
  if (
    typeof req.body.numOfMembers !== "number" ||
    req.body.numOfMembers < 2 ||
    8 < req.body.numOfMembers
  ) {
    res.status(400).json({
      message: "作成したいマッチグループの人数を2以上8以下の数値で指定してください。",
    });
    console.warn("numOfMembers is not specified or not valid");
    return false;
  }
  if (
    typeof req.body.departmentFilter !== "string" ||
    !["onlyMyDepartment", "excludeMyDepartment", "none"].includes(
      req.body.departmentFilter
    )
  ) {
    res.status(400).json({
      message:
        "マッチグループの部署フィルタを'onlyMyDepartment', 'excludeMyDepartment', 'none'のいずれかで指定してください。",
    });
    console.warn("departmentFilter is not specified or not valid");
    return false;
  }
  if (
    typeof req.body.officeFilter !== "string" ||
    !["onlyMyOffice", "excludeMyOffice", "none"].includes(
      req.body.officeFilter
    )
  ) {
    res.status(400).json({
      message:
        "マッチグループのオフィスフィルタを'onlyMyOffice', 'excludeMyOffice', 'none'のいずれかで指定してください。",
    });
    console.warn("officeFilter is not specified or not valid");
    return false;
  }
  if (
    !Array.isArray(req.body.skillFilter) ||
    !req.body.skillFilter.every((f: any) => typeof f === "string") ||
    req.body.skillFilter.some((skill: string) => skill === "")
  ) {
    res.status(400).json({
      message:
        "マッチグループのスキルフィルタを文字列の配列で指定してください（空文字は含めないでください）。",
    });
    console.warn("skillFilter is not specified or not valid");
    return false;
  }
  if (
    typeof req.body.neverMatchedFilter !== "boolean"
  ) {
    res.status(400).json({
      message:
        "マッチグループのneverMatchedフィルタを真偽値で指定してください。",
    });
    console.warn("neverMatchedFilter is not specified or not valid");
    return false;
  }

  return true;
};

const isReqBodyValueCorrect = async (
  reqBody: MatchGroupConfig,
  res: express.Response
) => {
  const noExistSkill = await checkSkillsRegistered(reqBody.skillFilter);
  if (noExistSkill !== undefined) {
    res.status(400).json({
      message: `${noExistSkill}はスキルとして登録されていません。`,
    });
    console.warn(`skill must be registered in skill table`);
    return false;
  }

  return true;
};

// マッチグループ取得API
matchGroupRouter.get(
  "/members/:userId",
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const userId: string = req.params.userId;

    try {
      const user = await getUserByUserId(userId);
      if (!user) {
        res.status(404).json({
          message: "指定されたユーザーは存在しません。",
        });
        console.warn("specified user does not exist");
        return;
      }
      const status = req.query.status === "open" ? "open" : "all";
      let limit = Math.trunc(Number(req.query.limit));
      if (Number.isNaN(limit) || limit < 0 || 100 < limit) {
        limit = 20;
      }

      let offset = Math.trunc(Number(req.query.offset));
      if (Number.isNaN(offset) || offset < 0) {
        offset = 0;
      }

      const matchGroupIds = await getMatchGroupIdsByUserId(user.userId);
      console.log(`user participated in ${matchGroupIds.length} match groups`);
      if (matchGroupIds.length === 0) {
        res.json([]);
        return;
      }

      const matchGroups = await getMatchGroupsByMatchGroupIds(
        matchGroupIds,
        status
      );
      if (matchGroups.length === 0) {
        res.json([]);
        console.log("no valid match groups found");
        return;
      }

      // ステータスの降順 (openが先)・作成日の降順・マッチグループ名の昇順でソート
      matchGroups.sort((a, b) => {
        if (a.status === "open" && b.status === "close") return -1;
        if (a.status === "close" && b.status === "open") return 1;
        if (new Date(a.createdAt) > new Date(b.createdAt)) return -1;
        if (new Date(a.createdAt) < new Date(b.createdAt)) return 1;
        if (a.matchGroupName < b.matchGroupName) return -1;
        if (a.matchGroupName > b.matchGroupName) return 1;
        return 0;
      });

      res.json(matchGroups.slice(offset, offset + limit));
      console.log("successfully found match groups");
    } catch (e) {
      next(e);
    }
  }
);

