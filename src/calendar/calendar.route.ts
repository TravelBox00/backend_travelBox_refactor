/* eslint-disable prettier/prettier */
/* eslint-disable import/extensions */

import { Router } from 'express';
import {
  addCalendar,
  removeCalendar,
  fixCalendar,
  getMySchedule
} from './calendar.controller.ts';

const router = Router();

/**
 * @swagger
 * /calendar/add:
 *   post:
 *     summary: 일정 추가
 *     tags:
 *       - Calendar
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
 *                type: string
 *                example: user123
 *               travelTitle:
 *                 type: string
 *                 example: 가족여행
 *               travelContent:
 *                 type: string
 *                 example: 오사카
 *               travelStartDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-01-15
 *               travelEndDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-01-20
 *     responses:
 *       200:
 *         description: 일정 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 일정 추가 완료
 *                 result:
 *                   type: object
 *                   properties:
 *                     travelId:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: 요청 필드가 유효하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: userId와 travelTitle은 필수 입력값입니다.
 *       500:
 *         description: 서버 에러
 */

/**
 * @swagger
 * /calendar/remove:
 *   delete:
 *     summary: 일정 삭제
 *     tags:
 *       - Calendar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               travelId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: 일정 삭제 성공
 *       400:
 *         description: travelId는 필수 입력값입니다.
 *       404:
 *         description: 해당 일정이 존재하지 않습니다.
 */

/**
 * @swagger
 * /calendar/fix:
 *   put:
 *     summary: 일정 수정
 *     tags:
 *       - Calendar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               travelId:
 *                 type: integer
 *                 example: 2
 *               travelTitle:
 *                 type: string
 *                 example: 가족여행
 *               travelContent:
 *                 type: string
 *                 example: 오사카
 *               travelStartDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-01-15
 *               travelEndDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-01-20
 *     responses:
 *       200:
 *         description: 일정 수정 성공
 *       400:
 *         description: travelId는 필수 입력값입니다.
 *       404:
 *         description: 해당 일정이 존재하지 않습니다.
 */

/**
 * @swagger
 * /calendar/my:
 *   get:
 *     summary: 특정 날짜의 일정 조회
 *     tags:
 *       - Calendar
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userTag
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자의 userTag
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: 조회할 날짜 (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: 일정 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       travelId:
 *                         type: integer
 *                         example: 3
 *                       travelTitle:
 *                         type: string
 *                         example: 가족여행
 *                       travelContent:
 *                         type: string
 *                         example: 오사카
 *                       travelStartDate:
 *                         type: string
 *                         format: date
 *                         example: 2025-01-15
 *                       travelEndDate:
 *                         type: string
 *                         format: date
 *                         example: 2025-01-20
 *       400:
 *         description: userTag와 date는 필수 입력값입니다.
 *       500:
 *         description: 서버 에러
 */

// 일정 추가
router.post('/add', addCalendar);

// 일정 삭제
router.delete('/remove', removeCalendar);

// 일정 수정
router.put('/fix', fixCalendar);

// 특정 날짜의 일정 조회
router.get('/my', getMySchedule);


export default router;
