import { Router } from 'express';
import { searchFollowerController, searchFollowingController, showFollowerController, showFollowingController, userAddFollowController } from './follow.controller.ts';

const router = Router();

router.get("/", (req, res) => {
  res.send("Follow Main Route");
});

// 팔로우 추가 && if 팔로우가 이미 되어있다면 팔로우 취소
/**
 * @swagger
 * /follow/addFollow:
 *   post:
 *     summary: "팔로우 추가 및 팔로우 취소"
 *     description: "사용자가 다른 사용자를 팔로우하거나 이미 팔로우한 상태이면 팔로우를 취소하는 기능"
 *     tags: [Follow]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userTag:
 *                 type: string
 *                 description: "팔로우를 하는 사용자의 태그"
 *                 example: "john#123"
 *               followTag:
 *                 type: string
 *                 description: "팔로우 대상 사용자의 태그"
 *                 example: "jane#456"
 *     responses:
 *       200:
 *         description: "팔로우가 추가되거나 취소되었습니다."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Follow added successfully" 
 *       400:
 *         description: "잘못된 요청"
 *       404:
 *         description: "사용자 또는 팔로우 대상이 존재하지 않음"
 *       500:
 *         description: "서버 오류"
 */
router.post('/addFollow', userAddFollowController);

// Follower 보기
/**
 * @swagger
 * /follow/showFollower/{userTag}:
 *   get:
 *     summary: "팔로워 목록 조회"
 *     description: "사용자의 팔로워 목록을 조회하는 API"
 *     tags: [Follow]
 *     parameters:
 *       - name: userTag
 *         in: path
 *         description: "팔로워 목록을 조회할 사용자의 태그"
 *         required: true
 *         schema:
 *           type: string
 *           example: "john#123"
 *     responses:
 *       200:
 *         description: "팔로워 목록을 정상적으로 조회"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   followerUserId:
 *                     type: integer
 *                     description: "팔로워의 사용자 ID"
 *                   userTag:
 *                     type: string
 *                     description: "팔로워의 사용자 태그"
 *                   userProfileImage:
 *                     type: string
 *                     description: "팔로워의 프로필 이미지 URL"
 *                   isFollowing:
 *                     type: boolean
 *                     description: "해당 팔로워를 내가 팔로우하고 있는지 여부"
 *       400:
 *         description: "잘못된 요청"
 *       404:
 *         description: "사용자 또는 팔로워가 존재하지 않음"
 *       500:
 *         description: "서버 오류"
 */
router.get('/showFollower/:userTag', showFollowerController);

// Following 보기
/**
 * @swagger
 * /follow/showFollowing/{userTag}:
 *   get:
 *     summary: "팔로잉 목록 조회"
 *     description: "사용자가 팔로우한 목록을 조회하는 API"
 *     tags: [Follow]
 *     parameters:
 *       - name: userTag
 *         in: path
 *         description: "팔로잉 목록을 조회할 사용자의 태그"
 *         required: true
 *         schema:
 *           type: string
 *           example: "john#123"
 *     responses:
 *       200:
 *         description: "팔로잉 목록을 정상적으로 조회"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   followingUserId:
 *                     type: integer
 *                     description: "팔로잉된 사용자의 ID"
 *                   userTag:
 *                     type: string
 *                     description: "팔로잉된 사용자의 태그"
 *                   userProfileImage:
 *                     type: string
 *                     description: "팔로잉된 사용자의 프로필 이미지 URL"
 *                   isFollowedByThem:
 *                     type: boolean
 *                     description: "해당 사용자가 나를 팔로우하고 있는지 여부"
 *       400:
 *         description: "잘못된 요청"
 *       404:
 *         description: "사용자 또는 팔로잉 목록이 존재하지 않음"
 *       500:
 *         description: "서버 오류"
 */
router.get('/showFollowing/:userTag', showFollowingController);


// Follow 찾기
/**
 * @swagger
 * /follow/searchFollower/{myTag}/{follower}:
 *   get:
 *     summary: "팔로워 검색"
 *     description: "특정 유저(myTag)의 팔로워 정보를 검색합니다. follower는 userTag 또는 userNickname이 될 수 있습니다."
 *     tags: [Follow]
 *     parameters:
 *       - name: myTag
 *         in: path
 *         description: "검색할 유저의 태그"
 *         required: true
 *         schema:
 *           type: string
 *           example: "john#123"
 *       - name: follower
 *         in: path
 *         description: "검색할 팔로워의 userTag 또는 userNickname"
 *         required: true
 *         schema:
 *           type: string
 *           example: "jane#456"
 *     responses:
 *       200:
 *         description: "팔로워 정보 검색 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: integer
 *                   description: "팔로워의 ID"
 *                 userTag:
 *                   type: string
 *                   description: "팔로워의 태그"
 *                 userProfileImage:
 *                   type: string
 *                   description: "팔로워의 프로필 이미지 URL"
 *                 userNickname:
 *                   type: string
 *                   description: "팔로워의 닉네임"
 *       404:
 *         description: "팔로워 또는 사용자 정보를 찾을 수 없음"
 *       500:
 *         description: "서버 오류"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: "서버 오류 메시지"
 */
router.get('/searchFollower/:myTag/:follower', searchFollowerController);

/**
 * @swagger
 * /follow/searchFollowing/{myTag}/{following}:
 *   get:
 *     summary: "팔로잉 검색"
 *     description: "특정 유저(myTag)의 팔로잉 정보를 검색합니다. following은 userTag 또는 userNickname이 될 수 있습니다."
 *     tags: [Follow]
 *     parameters:
 *       - name: myTag
 *         in: path
 *         description: "검색할 유저의 태그"
 *         required: true
 *         schema:
 *           type: string
 *           example: "john#123"
 *       - name: following
 *         in: path
 *         description: "검색할 팔로잉의 userTag 또는 userNickname"
 *         required: true
 *         schema:
 *           type: string
 *           example: "jane#456"
 *     responses:
 *       200:
 *         description: "팔로잉 정보 검색 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: integer
 *                   description: "팔로잉된 사용자의 ID"
 *                 userTag:
 *                   type: string
 *                   description: "팔로잉된 사용자의 태그"
 *                 userProfileImage:
 *                   type: string
 *                   description: "팔로잉된 사용자의 프로필 이미지 URL"
 *                 userNickname:
 *                   type: string
 *                   description: "팔로잉된 사용자의 닉네임"
 *       404:
 *         description: "팔로잉 또는 사용자 정보를 찾을 수 없음"
 *       500:
 *         description: "서버 오류"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: "서버 오류 메시지"
 */
router.get('/searchFollowing/:myTag/:following', searchFollowingController);
export default router;