
import express from "express";
import { v4 as uuidv4 } from "uuid";
import { createHash } from "crypto";
import {
  getUserIdByMailAndPassword,
  getUserByUserId,
} from "../users/repository";
import {
  getSessionByUserId,
  createSession,
  getSessionBySessionId,
  deleteSessions,
} from "./repository";

export const sessionRouter = express.Router();

// ログインAPI
sessionRouter.post(
  "/",
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (
      !req.body.mail ||
      typeof req.body.mail !== "string" ||
      !req.body.password ||
      typeof req.body.password !== "string"
    ) {
      res.status(400).json({
        message: "メールアドレスとパスワードを文字列で入力してください。",
      });
      console.warn("email or password is empty or not string");
      return;
    }

    const { mail, password }: { mail: string; password: string } = req.body;

    const hashedPassword = createHash("sha256").update(password).digest("hex");

    try {
      const userId = await getUserIdByMailAndPassword(mail, hashedPassword);
      if (!userId) {
        res.status(401).json({
          message: "メールアドレスまたはパスワードが正しくありません。",
        });
        console.warn("email or password is invalid");
        return;
      }

      const user = await getUserByUserId(userId);
      if (!user) {
        res.status(404).json({
          message: "指定されたユーザーは存在しません。",
        });
        console.warn("specified user does not exist");
        return;
      }

      const session = await getSessionByUserId(userId);
      if (session) {
        res.cookie("SESSION_ID", session.sessionId, {
          httpOnly: true,
          path: "/",
        });
        res.json(session);
        console.log("user already logged in");
        return;
      }

      const sessionId = uuidv4();
      await createSession(sessionId, userId, new Date());
      const createdSession = await getSessionBySessionId(sessionId);
      if (!createdSession) {
        res.status(500).json({
          message: "ログインに失敗しました。",
        });
        console.error("failed to insert session");
        return;
      }

      res.cookie("SESSION_ID", createdSession.sessionId, {
        httpOnly: true,
        path: "/",
      });
      res.status(201).json(createdSession);
      console.log("successfully logged in");
    } catch (e) {
      next(e);
    }
  }
);

// ログアウトAPI
sessionRouter.delete(
  "/",
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const sessionId = req.cookies["SESSION_ID"];
      if (!sessionId) {
        res.status(400).json({
          message: "セッションが見つかりません。",
        });
        console.warn("session ID is missing");
        return;
      }

      const session = await getSessionBySessionId(sessionId);
      if (!session) {
        res.status(404).json({
          message: "指定されたセッションは存在しません。",
        });
        console.warn("specified session does not exist");
        return;
      }

      await deleteSessions(session.userId);
      res.clearCookie("SESSION_ID", { httpOnly: true, path: "/" });
      res.status(204).send();
      console.log("successfully logged out");
    } catch (e) {
      next(e);
    }
  }
);

