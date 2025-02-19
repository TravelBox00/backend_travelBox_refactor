import { ResultSetHeader } from 'mysql2/promise';
import { pool } from '../../configs/database/mysqlConnect.ts';
import { hashedSignupDto } from '../dto/signup.dto.ts';

export const userInfoRegisterByUserTag = async (userInfo: hashedSignupDto) => {
  try {
    const { userTag, hashedPassword, userNickname, userProfileImage, email } =
      userInfo;
    const connection = await pool.getConnection();
    const query = `
            INSERT INTO User (userTag, userPassword, userNickname, userProfileImage, email)
            VALUES (?, ?, ?)
            `;
    await connection.execute(query, [
      userTag,
      hashedPassword,
      userNickname,
      userProfileImage,
      email,
    ]);
    connection.release();
  } catch (error) {
    console.error(error);
    throw new Error();
  }
};

export const findUserTagByUserTag = async (
  userTag: string
): Promise<number> => {
  try {
    const connection = await pool.getConnection();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [[rows]]: any = await connection.execute(
      `
            SELECT COUNT(*) as count
            FROM User 
            WHERE userTag = ?
            `,
      [userTag]
    );
    connection.release();
    return rows.count;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
};

export const changeIsDeletedByUserTag = async (
  userTag: string
): Promise<number> => {
  const connection = await pool.getConnection();
  await connection.beginTransaction(); // 트랜잭션 시작

  try {
    // Promise.all을 사용하여 동시에 실행
    const [userResult, threadResult] = await Promise.all([
      connection.query<ResultSetHeader>(
        `UPDATE User SET isDelete = 1 - isDelete WHERE userTag = ?`,
        [userTag]
      ),
      connection.query<ResultSetHeader>(
        `UPDATE TravelThread 
         SET isDelete = 1 - isDelete 
         WHERE userId = (SELECT userId FROM User WHERE userTag = ?)`,
        [userTag]
      ),
    ]);

    await connection.commit(); // 트랜잭션 커밋

    // affectedRows 값을 합산하여 반환 (배열의 첫 번째 요소에서 가져와야 함)
    const affectedRows =
      userResult[0].affectedRows + threadResult[0].affectedRows;
    console.log(affectedRows);
    return affectedRows;
  } catch (error) {
    await connection.rollback();
    console.error(error);
    throw new Error();
  }
};

export const userInfoChangeByUserTag = async (
  userTag: string,
  hashedPassword?: string,
  userNickname?: string
) => {
  try {
    const connection = await pool.getConnection();
    const updates = [];
    const params = [];

    if (hashedPassword !== undefined) {
      updates.push('userPassword = ?');
      params.push(hashedPassword);
    }
    if (userNickname !== undefined) {
      updates.push('userNickname = ?');
      params.push(userNickname);
    }
    params.push(userTag);
    const query = `
            UPDATE User SET 
            ${updates.join(', ')}
            WHERE userTag = ?
            `;
    await connection.query(query, params);
    connection.release();
  } catch (error) {
    console.error(error);
    throw new Error();
  }
};
