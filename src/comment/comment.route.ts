import { Router } from 'express';
import {
  addCommentController,
  updateCommentController,
  deleteCommentController,
  getMyCommentsController,
  getCommentsByThreadController,
} from './comment.controller.ts';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: 댓글 관련 API
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /comment/add:
 *   post:
 *     summary: 댓글 추가
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userTag:
 *                 type: string
 *                 description: 댓글을 조회할 사용자 태그
 *               threadId:
 *                 type: integer
 *                 description: 댓글이 작성될 게시글 ID
 *               commentContent:
 *                 type: string
 *                 description: 댓글 내용
 *               commentVisible:
 *                 type: string
 *                 enum: [public, private]
 *                 description: 댓글 공개 여부
 *     responses:
 *       201:
 *         description: 댓글 추가 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 에러
 */

/**
 * @swagger
 * /comment/fix:
 *   put:
 *     summary: 댓글 수정
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commentId:
 *                 type: integer
 *                 description: 수정할 댓글 ID
 *               commentContent:
 *                 type: string
 *                 description: 수정된 댓글 내용
 *               commentVisible:
 *                 type: string
 *                 enum: [public, private]
 *                 description: 수정된 댓글 공개 여부
 *     responses:
 *       200:
 *         description: 댓글 수정 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 에러
 */

/**
 * @swagger
 * /comment/remove:
 *   delete:
 *     summary: 댓글 삭제
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commentId:
 *                 type: integer
 *                 description: 삭제할 댓글 ID
 *     responses:
 *       200:
 *         description: 댓글 삭제 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 에러
 */

/**
 * @swagger
 * /comment/info:
 *   get:
 *     summary: 내가 작성한 댓글 목록 조회
 *     tags:
 *       - Comments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userTag
 *         required: true
 *         schema:
 *           type: string
 *         description: 댓글을 조회할 사용자 태그
 *     responses:
 *       200:
 *         description: 댓글 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   description: 요청 성공 여부
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       commentId:
 *                         type: integer
 *                         description: 댓글 ID
 *                       commentContent:
 *                         type: string
 *                         description: 댓글 내용
 *                       commentDate:
 *                         type: string
 *                         format: date
 *                         description: 댓글 작성 날짜
 *                       postContent:
 *                         type: string
 *                         description: 댓글이 작성된 게시글 내용
 *                       postOwnerNickname:
 *                         type: string
 *                         description: 게시글 작성자의 닉네임
 *       400:
 *         description: 필수 필드 누락
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 에러
 */

/**
 * @swagger
 * /comment/show:
 *   get:
 *     summary: 특정 게시글의 댓글 조회
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: query
 *         name: threadId
 *         required: true
 *         schema:
 *           type: integer
 *           description: 댓글을 조회할 게시글 ID
 *     responses:
 *       200:
 *         description: 댓글 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   description: 요청 성공 여부
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       commentId:
 *                         type: integer
 *                         description: 댓글 ID
 *                       commentContent:
 *                         type: string
 *                         description: 댓글 내용
 *                       commentVisible:
 *                         type: string
 *                         enum: [public, private]
 *                         description: 댓글 공개 여부
 *                       commenterNickname:
 *                         type: string
 *                         description: 댓글 작성자 닉네임
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 에러
 */

router.post('/add', addCommentController);
router.put('/fix', updateCommentController);
router.delete('/remove', deleteCommentController);
router.get('/info', getMyCommentsController);
router.get('/show', getCommentsByThreadController);

export default router;
