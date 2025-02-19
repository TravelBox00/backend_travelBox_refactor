import {
  insertComment,
  updateComment,
  deleteComment,
  checkCommentExists,
  getMyComments,
  getCommentsByThreadId,
} from './comment.model.ts';

// 댓글 추가
// eslint-disable-next-line import/prefer-default-export
export const addComment = async (commentData: {
  userTag: string;
  threadId: number;
  commentContent: string;
  commentVisible: 'public' | 'private';
}) => {
  try {
    return await insertComment(commentData);
  } catch (error) {
    console.error('Error in addComment service:', error);
    return false;
  }
};

// 댓글 수정
export const editComment = async (commentData: {
  commentId: number;
  commentContent: string;
  commentVisible: 'public' | 'private';
}) => {
  const { commentId } = commentData;

  const exists = await checkCommentExists(commentId);
  if (!exists) {
    throw new Error('댓글이 존재하지 않습니다.');
  }

  try {
    return await updateComment(commentData);
  } catch (error) {
    console.error('Error in editComment service:', error);
    throw error;
  }
};

// 댓글 삭제
export const removeComment = async (commentId: number) => {
  const exists = await checkCommentExists(commentId);
  if (!exists) {
    throw new Error('댓글이 존재하지 않습니다.');
  }

  try {
    return await deleteComment(commentId);
  } catch (error) {
    console.error('Error in removeComment service:', error);
    throw error;
  }
};

// 내가 작성한 댓글 조회
export const fetchMyComments = async (userTag: string) => {
  try {
    const comments = await getMyComments(userTag);

    if (comments.length === 0) {
      return {
        isSuccess: true,
        message: 'No comments found.',
        result: [],
      };
    }

    return {
      isSuccess: true,
      result: comments,
    };
  } catch (error) {
    console.error('Error in fetchMyComments service:', error);
    throw new Error('Failed to fetch comments');
  }
};

// 특정 게시글의 댓글 조회
export const fetchCommentsByThread = async (threadId: number) => {
  try {
    const comments = await getCommentsByThreadId(threadId);

    if (comments.length === 0) {
      return {
        isSuccess: true,
        message: 'No comments found for the given thread ID.',
        result: [],
      };
    }

    return {
      isSuccess: true,
      result: comments,
    };
  } catch (error) {
    console.error('Error in fetchCommentsByThread service:', error);
    throw new Error('Failed to fetch comments for the thread.');
  }
};
