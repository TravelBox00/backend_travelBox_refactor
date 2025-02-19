import { OkPacket, RowDataPacket } from 'mysql2';
import { pool } from '../configs/database/mysqlConnect.ts';

// 댓글 존재 확인
export const checkCommentExists = async (
  commentId: number
): Promise<boolean> => {
  const query = `SELECT COUNT(*) AS count FROM Comment WHERE commentId = ?`;

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(query, [commentId]);

    const count = rows[0].count as number;
    return count > 0;
  } catch (error) {
    console.error('Error in checkCommentExists:', error);
    throw error;
  }
};

// 댓글 추가
// eslint-disable-next-line import/prefer-default-export
export const insertComment = async (commentData: {
  userTag: string;
  threadId: number;
  commentContent: string;
  commentVisible: 'public' | 'private';
}) => {
  const { userTag, threadId, commentContent, commentVisible } = commentData;

  const userQuery = `SELECT userId FROM User WHERE userTag = ?`;
  const commentQuery = `
    INSERT INTO Comment (userId, threadId, commentContent, commentVisible, commentDate)
    VALUES (?, ?, ?, ?, CURDATE())
  `;

  try {
    const [userResult] = await pool.execute<RowDataPacket[]>(userQuery, [
      userTag,
    ]);

    if (userResult.length === 0) {
      throw new Error(`유저(${userTag})를 찾을 수 없습니다.`);
    }

    // eslint-disable-next-line prettier/prettier
    const {userId} = userResult[0]; 

    const [result] = await pool.execute<OkPacket>(commentQuery, [
      userId,
      threadId,
      commentContent,
      commentVisible,
    ]);

    return result.insertId;
  } catch (error) {
    console.error('댓글 추가 중 오류 발생:', error);
    throw error;
  }
};

// 댓글 수정
export const updateComment = async (commentData: {
  commentId: number;
  commentContent: string;
  commentVisible: 'public' | 'private';
}) => {
  const { commentId, commentContent, commentVisible } = commentData;

  const exists = await checkCommentExists(commentId);
  if (!exists) {
    throw new Error('Comment not found');
  }

  const query = `
    UPDATE Comment
    SET commentContent = ?, commentVisible = ?
    WHERE commentId = ?
  `;

  try {
    const [result] = await pool.execute(query, [
      commentContent,
      commentVisible,
      commentId,
    ]);
    return result;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

// 댓글 삭제
export const deleteComment = async (commentId: number): Promise<boolean> => {
  const exists = await checkCommentExists(commentId);

  if (!exists) {
    throw new Error('Comment not found');
  }

  const query = `
    DELETE FROM Comment
    WHERE commentId = ?
  `;

  try {
    const [result] = await pool.execute<OkPacket>(query, [commentId]);

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// 내가 작성한 댓글 조회
export const getMyComments = async (userTag: string) => {
  const query = `
    SELECT 
      c.commentId,
      c.commentContent,
      c.commentDate,
      tt.postContent,
      u.userNickname AS postOwnerNickname
    FROM 
      Comment AS c
    LEFT JOIN 
      TravelThread AS tt ON c.threadId = tt.threadId
    LEFT JOIN 
      User AS u ON tt.userId = u.userId
    WHERE 
      c.userId = ?
    ORDER BY 
      c.commentDate DESC
  `;

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(query, [userTag]);
    return rows.map((row) => ({
      commentId: row.commentId,
      commentContent: row.commentContent,
      commentDate: new Date(row.commentDate).toISOString().split('T')[0],
      postContent: row.postContent,
      postOwnerNickname: row.postOwnerNickname,
    }));
  } catch (error) {
    console.error('Error in getMyComments:', error);
    throw error;
  }
};

// 특정 게시글의 댓글 조회
export const getCommentsByThreadId = async (threadId: number) => {
  const query = `
    SELECT 
      c.commentId,
      c.commentContent,
      c.commentVisible,
      u.userNickname AS commenterNickname
    FROM 
      Comment AS c
    LEFT JOIN 
      User AS u ON c.userId = u.userId
    WHERE 
      c.threadId = ?
    ORDER BY 
      c.commentDate DESC
  `;

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(query, [threadId]);
    return rows.map((row) => ({
      commentId: row.commentId,
      commentContent: row.commentContent,
      commentVisible: row.commentVisible,
      commenterNickname: row.commenterNickname || 'Unknown User',
    }));
  } catch (error) {
    console.error('Error in getCommentsByThreadId:', error);
    throw error;
  }
};
