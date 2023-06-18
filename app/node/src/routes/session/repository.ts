import { RowDataPacket } from "mysql2";
import pool from "../../util/mysql";
import { Session } from "../../model/types";
import { convertDateToString } from "../../model/utils";

export const getSessionByUserId = async (
  userId: string
): Promise<Session | undefined> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT session_id, linked_user_id, created_at FROM session WHERE linked_user_id = ?",
    [userId]
  );
  const session = rows[0];
  if (!session) {
    return;
  }

  return {
    sessionId: session.session_id,
    userId: session.linked_user_id,
    createdAt: convertDateToString(session.created_at),
  };
};

// export const createSession = async (
//   sessionId: string,
//   userId: string,
//   now: Date
// ) => {
//   const formattedDate = now.toISOString().slice(0, 10); // or use a database-specific date formatting function
//   await pool.query(
//     "INSERT INTO session (session_id, linked_user_id, created_at) VALUES (?, ?, ?)",
//     [sessionId, userId, formattedDate]
//   );
// };

export const createSession = async (
  sessionId: string,
  userId: string,
  now: Date
) => {
  const formattedDate = now.toISOString().slice(0, 10);
  const query = "INSERT INTO session (session_id, linked_user_id, created_at) VALUES (?, ?, ?)";
  const values = [sessionId, userId, formattedDate];
  await pool.query(query, values);
};



export const getSessionBySessionId = async (
  sessionId: string
): Promise<Session | undefined> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT session_id, linked_user_id, created_at FROM session WHERE session_id = ?",
    [sessionId]
  );
  const session = rows[0];
  if (!session) {
    return;
  }

  return {
    sessionId: session.session_id,
    userId: session.linked_user_id,
    createdAt: convertDateToString(session.created_at),
  };
};

export const deleteSessions = async (userId: string) => {
  await pool.query("DELETE FROM session WHERE linked_user_id = ?", [userId]);
};

