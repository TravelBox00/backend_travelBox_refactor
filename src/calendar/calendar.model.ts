/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line import/extensions
import { ResultSetHeader } from 'mysql2';
import { pool } from '../configs/database/mysqlConnect.ts';

export interface Calendar {
  userTag: string;
  travelTitle: string;
  travelContent?: string;
  travelStartDate?: string;
  travelEndDate?: string;
}

// 일정 추가
export const insertCalendar = async (calendar: Calendar) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const userQuery = `SELECT userId FROM User WHERE userTag = ?`;
    const [userResult]: any = await connection.query(userQuery, [
      calendar.userTag,
    ]);

    if (userResult.length === 0) {
      throw new Error('User not found in the database.');
    }

    const { userId } = userResult[0];

    const insertQuery = `
      INSERT INTO TravelCalendar (userId, travelTitle, travelContent, travelStartDate, travelEndDate)
      VALUES (?, ?, ?, ?, ?);
    `;

    const values = [
      userId,
      calendar.travelTitle,
      calendar.travelContent || null,
      calendar.travelStartDate || null,
      calendar.travelEndDate || null,
    ];

    const [result] = await connection.query<ResultSetHeader>(
      insertQuery,
      values
    );

    await connection.commit();
    return { travelId: result.insertId };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    await connection.rollback();
    throw new Error('Database Insert Failed');
  } finally {
    connection.release();
  }
};

// 일정 삭제
export const removeCalendar = async (travelId: number) => {
  const query = `
    DELETE FROM TravelCalendar
    WHERE travelId = ?
  `;

  const [result] = await pool.query(query, [travelId]);
  return result;
};

// 일정 수정
export const updateCalendar = async (calendar: {
  travelId: number;
  travelTitle: string;
  travelContent?: string;
  travelStartDate?: string;
  travelEndDate?: string;
}) => {
  const query = `
    UPDATE TravelCalendar
    SET travelTitle = ?, travelContent = ?, travelStartDate = ?, travelEndDate = ?
    WHERE travelId = ?
  `;

  const values = [
    calendar.travelTitle,
    calendar.travelContent || null,
    calendar.travelStartDate || null,
    calendar.travelEndDate || null,
    calendar.travelId,
  ];

  const [result] = await pool.query(query, values);
  return result;
};

// 내 일정 조회
export const getMySchedule = async (userTag: string, date: string) => {
  const query = `
    SELECT t.travelId, t.travelTitle, t.travelContent, t.travelStartDate, t.travelEndDate
    FROM TravelCalendar t
    JOIN User u ON t.userId = u.userId
    WHERE u.userTag = ? AND ? BETWEEN t.travelStartDate AND t.travelEndDate
    ORDER BY t.travelStartDate ASC
  `;

  const [result] = await pool.query(query, [userTag, date]);
  return result;
};
