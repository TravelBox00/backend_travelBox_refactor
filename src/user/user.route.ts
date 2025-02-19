import express from 'express';
import {
  loginController,
  refreshTokenController,
  logoutController,
  userInfoController,
} from './controllers/userLogin.controller.ts';

import {
  signupController,
  duplicateController,
  signoutController,
  modifyController,
  backController,
} from './controllers/userSign.controller.ts';

import { authenticateToken } from '../middlewares/auth.middleware.ts';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('User main route');
});

router.post('/login', loginController);
router.post('/login/refresh', refreshTokenController);
router.delete('/logout', authenticateToken, logoutController);
router.post('/signup', signupController);
router.get('/signup/duplicate/:userTag', duplicateController);
router.patch('/signout', authenticateToken, signoutController);
router.patch('/back', backController);
router.patch('/modify', authenticateToken, modifyController);
router.get('/info', authenticateToken, userInfoController);
/**
 * @swagger
 * tags:
 *   - name: User
 *     description: 사용자 관련 API
 */

/**
 * @swagger
 *  /users/login:
 *   post:
 *     summary: 사용자 로그인
 *     description: 사용자 로그인 후 accessToken과 refreshToken을 반환합니다.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userTag:
 *                 type: string
 *                 example: johndoe123
 *               userPassword:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: object
 *                   properties:
 *                     userTag:
 *                       type: string
 *                       example: "johndoe123"
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Invalid password.
 *       404:
 *         description: User ID does not exist.
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 *  /users/login/refresh:
 *   post:
 *     summary: Access Token 재발급
 *     description: Refresh Token을 사용하여 새로운 Access Token을 발급합니다.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userTag:
 *                 type: string
 *                 example: johndoe123
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: 토큰 재발급 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: The token provided is invalid or expired.
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 *  /users/logout:
 *   delete:
 *     summary: 로그아웃
 *     description: 사용자를 로그아웃하고 Refresh Token을 무효화합니다.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: User ID does not exist.
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: 회원가입 (Create a new user)
 *     description: 새로운 사용자를 생성합니다.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userTag:
 *                 type: string
 *                 example: johndoe123
 *               userPassword:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               userNickname:
 *                 type: string
 *                 example: "John Doe"
 *     responses:
 *       200:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: object
 *                   properties:
 *                     userTag:
 *                       type: string
 *                       example: "johndoe123"
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *       403:
 *         description: |
 *           -Invalid nickname
 *           -Invalid password
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 * /users/signup/duplicate/{userTag}:
 *   get:
 *     summary: 아이디 중복 확인
 *     description: 새로운 사용자의 아이디(userTag)가 중복되는지 확인합니다.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: userTag
 *         required: true
 *         schema:
 *           type: string
 *           example: person
 *     responses:
 *       200:
 *         description: 아이디 중복 검사 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: object
 *                   properties:
 *                     isAvailable:
 *                       type: boolean
 *                       description: 아이디 사용 가능 여부 - 중복 여부에 따라 true(사용 불가) 또는 false(사용 가능)
 *                       example: false
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 *  /users/signout:
 *   delete:
 *     summary: 회원탈퇴
 *     description: 회원탈퇴
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 회원탈퇴 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   description: 회원탈퇴 성공 여부
 *                   example: true
 *       404:
 *         description: User ID does not exist.
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 *  /users/modify:
 *   patch:
 *     summary: 사용자 정보 수정
 *     description: 사용자의 일부 정보를 수정합니다.
 *     tags:
 *       - User
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
 *                 example: johndoe123
 *               userPassword:
 *                 type: string
 *                 format: password
 *                 example: newpassword123
 *               userNickname:
 *                 type: string
 *                 example: "New Nickname"
 *     responses:
 *       200:
 *         description: 사용자 정보 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *       403:
 *         description: |
 *            -Invalid nickname
 *            -Invalid password
 *       500:
 *         description: Internal Server Error.
 */
/**
 * @swagger
 * /users/info:
 *   get:
 *     summary: 사용자 정보 조회
 *     description: 제공된 토큰의 사용자 태그를 기반으로 사용자 정보를 반환합니다.
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: authorization
 *         required: true
 *         type: string
 *         description: 'Bearer [token]'
 *     responses:
 *       200:
 *         description: 사용자 정보 검색 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   $ref: '#/definitions/UserInfo'
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 사용자 태그를 찾을 수 없음
 *       500:
 *         description: 서버 내부 오류
 *
 * definitions:
 *   UserInfo:
 *     type: object
 *     properties:
 *       userId:
 *         type: string
 *         example: 'user123'
 *       email:
 *         type: string
 *         example: 'user@example.com'
 *       name:
 *         type: string
 *         example: 'John Doe'
 */
export default router;
