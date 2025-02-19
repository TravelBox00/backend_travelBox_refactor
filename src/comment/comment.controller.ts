import { RequestHandler } from 'express';
import {
  addComment,
  editComment,
  removeComment,
  fetchMyComments,
  fetchCommentsByThread,
} from './comment.service.ts';
import { CustomError, errors } from '../middlewares/error.middleware.ts';

// 댓글 추가
export const addCommentController: RequestHandler = async (req, res, next) => {
  try {
    const { threadId, commentContent, commentVisible, userTag } = req.body;

    if (!threadId || !commentContent || commentVisible === undefined) {
      throw new CustomError(errors.NOT_INPUT_VALUE, new Error());
    }

    const commentId = await addComment({
      userTag,
      threadId,
      commentContent,
      commentVisible,
    });

    if (!commentId) {
      throw new CustomError(errors.SERVER_ERROR, new Error());
    }

    res.status(201).json({ isSuccess: true, result: { commentId } });
  } catch (error) {
    next(error);
  }
};

// 댓글 수정
export const updateCommentController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { commentId, commentContent, commentVisible } = req.body;

    if (!commentId || !commentContent || commentVisible === undefined) {
      throw new CustomError(errors.NOT_INPUT_VALUE, new Error());
    }

    const result = await editComment({
      commentId,
      commentContent,
      commentVisible,
    });

    if (!result) {
      throw new CustomError(
        errors.NOT_FOUND_USER_TAG,
        new Error('존재하지 않는 댓글입니다.')
      );
    }

    res.status(200).json({ isSuccess: true });
  } catch (error) {
    next(error);
  }
};

// 댓글 삭제
export const deleteCommentController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { commentId } = req.body;

    if (!commentId) {
      throw new CustomError(errors.NOT_INPUT_VALUE, new Error());
    }

    const result = await removeComment(commentId);

    if (!result) {
      throw new CustomError(
        errors.NOT_FOUND_USER_TAG,
        new Error('댓글이 존재하지 않습니다.')
      );
    }

    res.status(200).json({ isSuccess: true });
  } catch (error) {
    next(error);
  }
};

// 내가 작성한 댓글 조회
export const getMyCommentsController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const userTag = req.query.userTag as string;
    if (!userTag) {
      res.status(400).json({
        isSuccess: false,
        code: '4000',
        message: 'userTag를 query parameter로 제공해야 합니다.',
        result: null,
      });
      return;
    }
    const response = await fetchMyComments(userTag);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// 특정 게시글의 댓글 조회
export const getCommentsByThreadController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { threadId } = req.query;

    if (!threadId) {
      throw new CustomError(errors.NOT_INPUT_VALUE, new Error());
    }

    const response = await fetchCommentsByThread(Number(threadId));
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
