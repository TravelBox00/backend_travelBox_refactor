import { pool } from '../configs/database/mysqlConnect.ts';
import MyThread from './dto/myThread.dto.ts'; // DTO를 사용하여 스레드 타입을 정의

const getThreads = async (
  userTag: string,
  limit: number,
  cursor?: string
): Promise<MyThread[]> => {
  const cursorDate = cursor
    ? cursor.split('|')[0]
    : new Date().toISOString().slice(0, 10);
  const cursorId = cursor ? parseInt(cursor.split('|')[1], 10) : null;

  const query = `
    SELECT TT.postContent, TT.postDate, TT.threadId, I.imageURL
    FROM TravelThread AS TT
    JOIN User AS U ON U.userId = TT.userId
    LEFT JOIN Image AS I ON I.threadId = TT.threadId
    WHERE U.userTag = ? AND (TT.postDate < ? OR (TT.postDate = ? AND TT.threadId < ?))
    ORDER BY TT.postDate DESC, TT.threadId DESC
    LIMIT ?
  `;
  const params = [userTag, cursorDate, cursorDate, cursorId, limit];

  try {
    const [rows] = await pool.query(query, params);
    return rows as MyThread[];
  } catch (err) {
    console.error(err);
    throw new Error();
  }
};

export default getThreads;
