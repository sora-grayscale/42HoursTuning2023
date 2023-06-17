import { RowDataPacket } from "mysql2";
import pool from "../../util/mysql";
import { MatchGroup, MatchGroupDetail, User } from "../../model/types";
import { getUsersByUserIds } from "../users/repository";
import { convertToMatchGroupDetail } from "../../model/utils";


export const hasSkillNameRecord = async (
  skillName: string
): Promise<boolean> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT skill_id FROM skill WHERE skill_name = ? LIMIT 1",
    [skillName]
  );
  return rows.length > 0;
};

export const getMatchGroupDetailByMatchGroupId = async (
  matchGroupId: string,
  status?: string
): Promise<MatchGroupDetail | undefined> => {
  let query =
    "SELECT mg.match_group_id, mg.match_group_name, mg.description, mg.status, mg.created_by, mg.created_at, mm.user_id " +
    "FROM match_group AS mg " +
    "JOIN match_group_member AS mm ON mg.match_group_id = mm.match_group_id " +
    "WHERE mg.match_group_id = ?";
  if (status === "open") {
    query += " AND mg.status = 'open'";
  }
  const [rows] = await pool.query<RowDataPacket[]>(query, [matchGroupId]);
  if (rows.length === 0) {
    return;
  }

  const members: User[] = rows.map((row) => {
    const { user_id, ...rest } = row;
    return rest;
  });
  const matchGroupDetail = convertToMatchGroupDetail(rows[0]);
  matchGroupDetail.members = members;

  return matchGroupDetail;
};

export const insertMatchGroup = async (matchGroupDetail: MatchGroupDetail) => {
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    await conn.query(
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
      await conn.query(
        "INSERT INTO match_group_member (match_group_id, user_id) VALUES (?, ?)",
        [matchGroupDetail.matchGroupId, member.userId]
      );
    }

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

