import { RowDataPacket } from "mysql2";
import pool from "../../util/mysql";
import { MatchGroup, MatchGroupDetail, User } from "../../model/types";
import { getUsersByUserIds } from "../users/repository";
import { convertToMatchGroupDetail } from "../../model/utils";

export const hasSkillNameRecord = async (
  skillName: string
): Promise<boolean> => {
  const [rows] = await pool.query<RowDataPacket[]>(
	"SELECT skill_id, skill_name FROM skill WHERE skill_name = ?",
	[skillName]
  );
  return rows.length > 0;
};

export const getUserIdsBeforeMatched = async (
  userId: string
): Promise<string[]> => {
  const [matchGroupIdRows] = await pool.query<RowDataPacket[]>(
    "SELECT match_group_id FROM match_group_member WHERE user_id = ?",
    [userId]
  );
  if (matchGroupIdRows.length === 0) {
    return [];
  }

  const [userIdRows] = await pool.query<RowDataPacket[]>(
    "SELECT user_id FROM match_group_member WHERE match_group_id IN (?)",
    [matchGroupIdRows]
  );

  return userIdRows.map((row) => row.user_id);
};

export const insertMatchGroup = async (matchGroupDetail: MatchGroupDetail) => {
  await pool.query<RowDataPacket[]>(
    "INSERT INTO match_group (match_group_id, match_group_name, description, status, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [
      matchGroupDetail.matchGroupId,
      matchGroupDetail.matchGroupName,
      matchGroupDetail.description,
      matchGroupDetail.status,
      matchGroupDetail.createdBy,
      matchGroupDetail.createdAt,
    ]
  );

  for (const member of matchGroupDetail.members) {
    await pool.query<RowDataPacket[]>(
      "INSERT INTO match_group_member (match_group_id, user_id) VALUES (?, ?)",
      [matchGroupDetail.matchGroupId, member.userId]
    );
  }
};

/* export const getMatchGroupDetailByMatchGroupId = async (
  matchGroupId: string,
  status?: string
): Promise<MatchGroupDetail | undefined> => {
  let query =
    "SELECT match_group_id, match_group_name, description, status, created_by, created_at FROM match_group WHERE match_group_id = ?";
  if (status === "open") {
    query += " AND status = 'open'";
  }
  const [matchGroup] = await pool.query<RowDataPacket[]>(query, [matchGroupId]);
  if (matchGroup.length === 0) {
    return;
  }

  const [matchGroupMemberIdRows] = await pool.query<RowDataPacket[]>(
    "SELECT user_id FROM match_group_member WHERE match_group_id = ?",
    [matchGroupId]
  );
  const matchGroupMemberIds: string[] = matchGroupMemberIdRows.map(
    (row) => row.user_id
  );

  const searchedUsers = await getUsersByUserIds(matchGroupMemberIds);
  // SearchedUserからUser型に変換
  const members: User[] = searchedUsers.map((searchedUser) => {
    const { kana: _kana, entryDate: _entryDate, ...rest } = searchedUser;
    return rest;
  });
  matchGroup[0].members = members;

  return convertToMatchGroupDetail(matchGroup[0]);
};
 */

export const getMatchGroupDetailByMatchGroupId = async (
  matchGroupId: string,
  status?: string
): Promise<MatchGroupDetail | undefined> => {
  let query = `
    SELECT
      mg.match_group_id,
      mg.match_group_name,
      mg.description,
      mg.status,
      mg.created_by,
      mg.created_at,
      GROUP_CONCAT(mgm.user_id) AS member_ids
    FROM
      match_group AS mg
    INNER JOIN match_group_member AS mgm ON mgm.match_group_id = mg.match_group_id
    WHERE
      mg.match_group_id = ?
      ${status === "open" ? "AND mg.status = 'open'" : ""}
    GROUP BY
      mg.match_group_id
  `;

  const [matchGroup] = await pool.query<RowDataPacket[]>(query, [matchGroupId]);

  if (matchGroup.length === 0) {
    return;
  }

  const memberIds = matchGroup[0].member_ids.split(",");
  const searchedUsers = await getUsersByUserIds(memberIds);

  const members: User[] = searchedUsers.map((searchedUser) => {
    const { kana: _kana, entryDate: _entryDate, ...rest } = searchedUser;
    return rest;
  });

  const matchGroupDetail: MatchGroupDetail = {
    matchGroupId: matchGroup[0].match_group_id,
    matchGroupName: matchGroup[0].match_group_name,
    description: matchGroup[0].description,
    status: matchGroup[0].status,
    createdBy: matchGroup[0].created_by,
    createdAt: matchGroup[0].created_at,
    members: members,
  };

  return matchGroupDetail;
};




export const getMatchGroupIdsByUserId = async (
  userId: string
): Promise<string[]> => {
  const [matchGroupIds] = await pool.query<RowDataPacket[]>(
    "SELECT match_group_id FROM match_group_member WHERE user_id = ?",
    [userId]
  );
  return matchGroupIds.map((row) => row.match_group_id);
};

export const getMatchGroupsByMatchGroupIds = async (
  matchGroupIds: string[],
  status: string
): Promise<MatchGroup[]> => {
  let matchGroups: MatchGroup[] = [];
  for (const matchGroupId of matchGroupIds) {
    const matchGroupDetail = await getMatchGroupDetailByMatchGroupId(
      matchGroupId,
      status
    );
    if (matchGroupDetail) {
      const { description: _description, ...matchGroup } = matchGroupDetail;
      matchGroups = matchGroups.concat(matchGroup);
    }
  }

  return matchGroups;
};
