import express from 'express';
import {
  filterController,
  searchController,
  wordController,
} from './search.controller.ts';

const router = express.Router();
router.get('/', searchController);
router.get('/word', wordController);
router.get('/filter', filterController);
/**
 * @swagger
 * tags:
 *   name: Search
 *   description: 검색 API
 */

/**
 * @swagger
 * /search:
 *   get:
 *     summary: "시간별 검색된 게시물 반환"
 *     description: "검색어를 입력하면 해당 검색어와 관련된 게시물을 최신순으로 반환합니다."
 *     tags: [Search]
 *     parameters:
 *       - name: word
 *         in: query
 *         description: "검색할 단어"
 *         required: true
 *         schema:
 *           type: string
 *       - name: cursor
 *         in: query
 *         description: "커서"
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "검색 결과 반환"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/searchResDto'
 *                 isSuccess:
 *                   type: boolean
 */

/**
 * @swagger
 * /search/word:
 *   get:
 *     summary: "검색어 입력 시 자동완성 단어 반환"
 *     description: "사용자가 입력한 검색어를 기반으로 자동완성 단어 목록을 반환합니다."
 *     tags: [Search]
 *     parameters:
 *       - name: word
 *         in: query
 *         description: "입력된 검색어"
 *         required: true
 *         schema:
 *           type: string

 *     responses:
 *       200:
 *         description: "자동완성 검색어 반환"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: array
 *                   items:
 *                     type: string
 *                 isSuccess:
 *                   type: boolean
 */

/**
 * @swagger
 * /search/filter:
 *   get:
 *     summary: "카테고리 & 지역 필터 검색"
 *     description: "카테고리 또는 지역을 기준으로 게시물을 검색합니다."
 *     tags: [Search]
 *     parameters:
 *       - name: category
 *         in: query
 *         description: "검색할 카테고리 (예: 여행기록, 기념품 등)"
 *         required: false
 *         schema:
 *           type: string
 *       - name: region
 *         in: query
 *         description: "검색할 지역 (예: 서울, 부산 등)"
 *         required: false
 *         schema:
 *           type: string
 *       - name: cursor
 *         in: query
 *         description: "커서"
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "필터링된 게시물 반환"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/searchResDto'
 *                 isSuccess:
 *                   type: boolean
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     searchResDto:
 *       type: object
 *       properties:
 *         threadId:
 *           type: number
 *           description: "게시물 ID"
 *         postImageURL:
 *           type: string
 *           description: "게시물 대표 이미지 URL"
 *         postTitle:
 *           type: string
 *           description: "게시물 제목"
 *         postDate:
 *           type: string
 *           format: date-time
 *           description: "게시물 작성 날짜"
 */

export default router;
