import { Router } from 'express';
import multer from 'multer';
import {
  deletePostController,
  myPostCategoryController,
  myPostSearchController,
  popularPostController,
  postInfoController,
  postSearchController,
  updatePostController,
  upLoadPostController,
  toggleLike,
  toggleScrap,
  getScrappedThreads,
  getSpotifySongController,
  getFollowingPostController,
  getPopularTracksController,
} from './thread.controller.ts';
import getUserThreadController from './threadMy.controller.ts';

const router = Router();
const upload = multer(); // multer 미들웨어 설정

router.get('/', (req, res) => {
  res.send('Thread Main Route');
});

/**
 * @swagger
 * tags:
 *   - name: Thread
 *     description: 게시물 관련 API
 */

// eslint-disable-next-line import/extensions

/**
 * @swagger
 * /thread/like:
 *   post:
 *     summary: 게시물 좋아요
 *     description: 좋아요 추가 시 isLiked가 true, 취소 시 isLiked가 false로 반환됩니다.
 *     tags:
 *       - Thread
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               threadId:
 *                 type: integer
 *                 description: 게시물 ID
 *                 example: 1
 *               userTag:
 *                 type: string
 *                 description: 사용자 태그
 *                 example: "user123"
 *     responses:
 *       200:
 *         description: 현재 좋아요 상태 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   description: 요청 성공 여부
 *                   example: true
 *                 code:
 *                   type: string
 *                   description: 상태 코드
 *                   example: "2000"
 *                 message:
 *                   type: string
 *                   description: 처리 결과 메시지
 *                   example: "좋아요 성공"
 *                 result:
 *                   type: object
 *                   properties:
 *                     isLiked:
 *                       type: boolean
 *                       description: 현재 좋아요 상태
 *                       example: true
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /thread/scrap:
 *   post:
 *     summary: 게시물 스크랩
 *     description: 스크랩 추가 시 result.isScrapped가 true, 취소 시 result.isScrapped가 false로 반환됩니다.
 *     tags:
 *       - Thread
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               threadId:
 *                 type: integer
 *                 description: 게시물 ID
 *                 example: 1
 *               userTag:
 *                 type: string
 *                 description: 사용자 태그
 *                 example: "user123"
 *     responses:
 *       200:
 *         description: 현재 스크랩 상태 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   description: 요청 성공 여부
 *                   example: true
 *                 code:
 *                   type: string
 *                   description: 상태 코드
 *                   example: "2000"
 *                 message:
 *                   type: string
 *                   description: 처리 결과 메시지
 *                   example: "스크랩 성공"
 *                 result:
 *                   type: object
 *                   properties:
 *                     isScrapped:
 *                       type: boolean
 *                       description: 현재 스크랩 상태
 *                       example: true
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /thread/scrap/info:
 *   get:
 *     summary: 스크랩한 게시물 목록 조회
 *     description: 특정 사용자가 스크랩한 게시물 목록을 조회합니다.
 *     tags:
 *       - Thread
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userTag
 *         required: true
 *         schema:
 *           type: string
 *         description: "조회할 사용자의 태그"
 *     responses:
 *       200:
 *         description: 스크랩한 게시물 목록 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   description: 요청 성공 여부
 *                   example: true
 *                 code:
 *                   type: string
 *                   description: 상태 코드
 *                   example: "2000"
 *                 message:
 *                   type: string
 *                   description: 처리 결과 메시지
 *                   example: "스크랩한 게시물 목록 조회 성공"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       threadId:
 *                         type: integer
 *                         description: 게시물 ID
 *                         example: 1
 *                       postContent:
 *                         type: string
 *                         description: 게시물 내용
 *                         example: "I visited Paris and it was breathtaking!"
 *                       userNickname:
 *                         type: string
 *                         description: 작성자 닉네임
 *                         example: "JohnDoe"
 *                       isScrapped:
 *                         type: boolean
 *                         description: 스크랩 여부
 *                         example: true
 *                       photoUrl:
 *                         type: string
 *                         description: 사진 경로
 *                         example: "https://example.com/image.jpg"
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */

// 게시물 좋아요
router.post('/like', toggleLike);

// 게시물 스크랩
router.post('/scrap', toggleScrap);

// 스크랩한 게시물 목록
router.get('/scrap/info', getScrappedThreads);

// 포스터 작성
/**
 * @swagger
 * /thread/add:
 *   post:
 *     summary: 게시물 추가
 *     description: 게시물 추가, 최대 5개의 이미지 업로드 가능
 *     tags:
 *       - Thread
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               body:
 *                 type: string
 *                 description: JSON 형식의 게시물 정보 (문자열로 전달됨)
 *                 example: |
 *                   {
 *                     "userTag": "john#123",
 *                     "postCategory": "여행 기록",
 *                     "postContent": "스웨거 테스트 용 내용",
 *                     "postRegionCode": "서울 강남",
 *                     "clothId": 1,
 *                     "songName": "Inside Out"
 *                   }
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 업로드할 이미지 파일 (최대 5개)
 *     responses:
 *       201:
 *         description: 게시물 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: string
 *                   example: "2010"
 *                 message:
 *                   type: string
 *                   example: "게시물 업로드 성공"
 *                 result:
 *                   type: object
 *                   properties:
 *                     threadId:
 *                       type: integer
 *                       example: 123
 *                     imageUrls:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *       400:
 *         description: "잘못된 요청 (예: JSON 형식 오류, 이미지 업로드 실패)"
 *       500:
 *         description: 서버 오류
 */
router.post('/add', upload.array('files', 5), upLoadPostController);

// 이미지 업로드
// router.post("/upload", upload.array('files', 5), uploadImageController);

// 내가 쓴 포스트 상세 조회
/**
 *  @swagger
 * /thread/info:
 *   get:
 *     summary: 내가 쓴 포스트 상세 조회
 *     description: 특정 사용자가 작성한 특정 게시물의 상세 정보를 조회합니다.
 *     tags:
 *       - Thread
 *     parameters:
 *       - in: query
 *         name: userTag
 *         required: true
 *         schema:
 *           type: string
 *         description: 조회할 사용자의 태그
 *         example: "john#123"
 *       - in: query
 *         name: threadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 게시물의 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 게시물 상세 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 threadId:
 *                   type: integer
 *                   description: 게시물 ID
 *                   example: 1
 *                 postContent:
 *                   type: string
 *                   description: 게시물 내용
 *                   example: "이번 여행 너무 좋았어요!"
 *                 postDate:
 *                   type: string
 *                   format: date-time
 *                   description: 게시물 작성 날짜
 *                   example: "2024-01-31T12:34:56Z"
 *                 imageUrls:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: 게시물에 포함된 이미지 URL 리스트
 *                   example:
 *                     - "https://example.com/image1.jpg"
 *                     - "https://example.com/image2.jpg"
 *                 likes:
 *                   type: integer
 *                   description: 게시물 좋아요 수
 *                   example: 50
 *                 comments:
 *                   type: integer
 *                   description: 게시물 댓글 수
 *                   example: 10
 *                 scraps:
 *                   type: integer
 *                   description: 게시물 스크랩 수
 *                   example: 5
 *       400:
 *         description: 잘못된 요청 (필수 파라미터 누락 등)
 *       500:
 *         description: 서버 오류
 */
router.get('/info', postInfoController);

/**
 * @swagger
 * /thread/search:
 *   get:
 *     summary: 검색어에 따른 포스트 조회
 *     description: 특정 검색어를 포함하는 게시물을 조회합니다. (이미지, 제목, 날짜만 반환)
 *     tags:
 *       - Thread
 *     parameters:
 *       - in: query
 *         name: searchKeyword
 *         required: true
 *         schema:
 *           type: string
 *         description: "검색할 키워드"
 *         example: "my"
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *           default: 0
 *         description: "페이지네이션을 위한 오프셋 값 (기본값: 0)"
 *         example: 10
 *     responses:
 *       200:
 *         description: "검색 결과 반환 (이미지, 제목, 날짜만 제공)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       threadId:
 *                         type: integer
 *                         description: "게시물 ID"
 *                         example: 1
 *                       postDate:
 *                         type: string
 *                         format: date
 *                         description: "게시물 작성 날짜"
 *                         example: "2024-01-31"
 *                       imageUrl:
 *                         type: string
 *                         description: "게시물 대표 이미지 URL"
 *                         example: "https://example.com/image1.jpg"
 *                 totalResults:
 *                   type: integer
 *                   description: "검색 결과 총 개수"
 *                   example: 50
 *       400:
 *         description: "잘못된 요청 (필수 파라미터 누락 등)"
 *       500:
 *         description: "서버 오류"
 */
router.get('/search', postSearchController);

/**
 * @swagger
 * /thread/specific:
 *   get:
 *     summary: 내가 쓴 글 조회
 *     description: "특정 사용자가 작성한 게시물 목록을 조회합니다. (이미지, 제목만 반환)"
 *     tags:
 *       - Thread
 *     parameters:
 *       - in: query
 *         name: userTag
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 태그 (ID와 유사한 값)
 *         example: "john#123"
 *     responses:
 *       200:
 *         description: 사용자가 작성한 게시물 목록 반환 (이미지, 제목만 제공)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       threadId:
 *                         type: integer
 *                         description: 게시물 ID
 *                         example: 1
 *                       postContent:
 *                         type: string
 *                         description: 게시물 제목
 *                         example: "my"
 *                       imageUrl:
 *                         type: string
 *                         description: 게시물 대표 이미지 URL
 *                         example: "https://example.com/image1.jpg"
 *                 totalResults:
 *                   type: integer
 *                   description: 검색된 게시물 총 개수
 *                   example: 5
 *       400:
 *         description: 잘못된 요청 (필수 파라미터 누락 등)
 *       500:
 *         description: 서버 오류
 */
router.get('/specific', myPostSearchController);

// 카테고리 별 게시물 조회
/**
 * @swagger
 * /thread/category:
 *   get:
 *     summary: 카테고리별 게시물 조회
 *     description: 특정 사용자가 작성한 게시물을 카테고리별로 조회합니다.
 *     tags:
 *       - Thread
 *     parameters:
 *       - in: query
 *         name: userTag
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 태그 (ID와 유사한 값)
 *         example: "john#123"
 *       - in: query
 *         name: myCategory
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["여행 기록", "기념품", "여행지", "여행 코디"]
 *         description: "조회할 카테고리 (Enum 값: 여행 기록, 기념품, 여행지, 여행 코디)"
 *         example: "여행기록"
 *     responses:
 *       200:
 *         description: 카테고리별로 필터링된 게시물 목록 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       threadId:
 *                         type: integer
 *                         description: 게시물 ID
 *                         example: 1
 *                       imageUrl:
 *                         type: string
 *                         description: 게시물 대표 이미지 URL
 *                         example: "https://example.com/image1.jpg"
 *                 totalResults:
 *                   type: integer
 *                   description: 검색된 게시물 총 개수
 *                   example: 5
 *       400:
 *         description: "잘못된 요청 (필수 파라미터 누락 또는 유효하지 않은 카테고리 값)"
 *       500:
 *         description: "서버 오류"
 */
router.get('/category', myPostCategoryController);

/**
 * @swagger
 * /thread/update:
 *   patch:
 *     summary: 게시물 수정
 *     description: 특정 사용자의 게시물을 수정합니다.
 *     tags:
 *       - Thread
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userTag
 *               - threadId
 *               - postCategory
 *               - postContent
 *             properties:
 *               userTag:
 *                 type: string
 *                 description: 사용자 태그 (ID와 유사한 값)
 *                 example: "john#123"
 *               threadId:
 *                 type: integer
 *                 description: 수정할 게시물 ID
 *                 example: 1
 *               postCategory:
 *                 type: string
 *                 enum:
 *                  - "여행 기록"
 *                  - "기념품"
 *                  - "여행지"
 *                  - "여행 코디"
 *                 description: "게시물 카테고리 (Enum 값: 여행 기록, 기념품, 여행지, 여행 코디)"
 *                 example: "여행 기록"
 *               postContent:
 *                 type: string
 *                 description: 수정할 게시물 내용
 *                 example: "이번 여행은 정말 멋졌어요!"
 *     responses:
 *       200:
 *         description: 게시물 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   description: 요청 성공 여부
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: 처리 결과 메시지
 *                   example: "게시물 수정 성공"
 *                 result:
 *                   type: object
 *                   properties:
 *                     threadId:
 *                       type: integer
 *                       description: 수정된 게시물 ID
 *                       example: 1
 *                     updatedTitle:
 *                       type: string
 *                       description: 수정된 제목
 *                       example: "여행의 추억"
 *                     updatedContent:
 *                       type: string
 *                       description: 수정된 내용
 *                       example: "이번 여행은 정말 멋졌어요!"
 *       400:
 *         description: 잘못된 요청 (필수 필드 누락, 유효하지 않은 카테고리 또는 제목 길이 부족)
 *       500:
 *         description: 서버 오류
 */
router.patch('/update', updatePostController);

// 포스트 삭제 (DB상에서 삭제는 잘됨 단 S3에 있는 이미지는 삭제가 안됨 해결해야함)
/**
 * @swagger
 * /thread/delete:
 *   delete:
 *     summary: Delete a post and associated images
 *     description: Deletes a post from the database and removes associated images from S3.
 *     tags:
 *       - Thread
 *     parameters:
 *       - in: query
 *         name: userTag
 *         description: The user tag of the user who created the post.
 *         required: true
 *         schema:
 *           type: string
 *           example: john#123
 *       - in: query
 *         name: threadId
 *         description: The ID of the thread to delete.
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Post and associated images deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Post deleted successfully'
 *       400:
 *         description: Error deleting the post or image.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Error deleting post: No images uploaded'
 */
router.delete('/delete', deletePostController);

/**
 * @swagger
 * /thread/popular:
 *   get:
 *     summary: 인기 게시물 조회
 *     description: 좋아요, 댓글, 스크랩 수를 기반으로 인기 게시물을 정렬하여 조회합니다. 페이지네이션을 지원합니다.
 *     tags:
 *       - Thread
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         required: false
 *         description: "조회할 페이지 (기본값: 1)"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 20
 *         required: false
 *         description: "한 페이지에 보여줄 게시물 개수 (기본값: 20)"
 *     responses:
 *       200:
 *         description: 인기 게시물 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   description: 현재 페이지 번호
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   description: 한 페이지당 조회된 게시물 개수
 *                   example: 20
 *                 totalPosts:
 *                   type: integer
 *                   description: 전체 인기 게시물 개수
 *                   example: 100
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       threadId:
 *                         type: integer
 *                         description: 게시물 ID
 *                         example: 1
 *                       postDate:
 *                         type: string
 *                         format: date
 *                         description: 게시물 작성 날짜
 *                         example: "2024-01-31"
 *                       imageInfoId:
 *                         type: integer
 *                         description: 대표 이미지 ID
 *                         example: 123
 *                       totalEngagement:
 *                         type: integer
 *                         description: 좋아요, 댓글, 스크랩 수를 합산한 인기 지수
 *                         example: 45
 *       400:
 *         description: 잘못된 요청 (쿼리 파라미터 오류 등)
 *       500:
 *         description: 서버 오류
 */
router.get('/popular', popularPostController);

/**
 * @swagger
 * /thread/spotifySong:
 *   get:
 *     summary: "Spotify 노래 검색"
 *     description: "Spotify에서 특정 노래를 검색하여 노래 정보를 반환합니다."
 *     tags:
 *       - "Spotify"
 *     parameters:
 *       - in: query
 *         name: songName
 *         required: true
 *         description: "검색할 노래 제목"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "성공적으로 노래 정보를 가져옴"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tracks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: "노래 제목"
 *                       external_urls:
 *                         type: object
 *                         properties:
 *                           spotify:
 *                             type: string
 *                             description: "Spotify 노래 URL"
 *                       artists:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               description: "아티스트 이름"
 *       400:
 *         description: "요청 오류 - songName 파라미터 누락"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Track ID is required"
 *       500:
 *         description: "서버 내부 오류"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 message:
 *                   type: string
 *                   example: "오류 메시지"
 */
router.get('/spotifySong', getSpotifySongController);

/**
 * @swagger
 * /thread/getFollowPost:
 *   get:
 *     summary: 내가 팔로잉하는 사람들의 게시물을 최신순으로 봄
 *     description: 내가 팔로잉하는 사람들의 게시물을 최신순으로 봄
 *     tags:
 *       - Thread
 *     parameters:
 *       - in: query
 *         name: userTag
 *         required: true
 *         description: The tag of the user whose followed posts are being fetched
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userTag:
 *                     type: string
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.get('/getFollowPost', getFollowingPostController);

/**
 * @swagger
 * /thread/songPopular:
 *   get:
 *     summary: Fetch Global Top 50 tracks from Spotify
 *     description: Fetches the current Global Top 50 playlist from Spotify and saves it as a JSON file.
 *     tags:
 *       - Spotify
 *     responses:
 *       200:
 *         description: A list of Global Top 50 tracks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The name of the track.
 *                   external_urls:
 *                     type: object
 *                     description: External URL for the track.
 *                     properties:
 *                       spotify:
 *                         type: string
 *                         description: Spotify URL for the track.
 *                   artists:
 *                     type: array
 *                     description: List of artists for the track.
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           description: The name of the artist.
 *       500:
 *         description: Server error or Spotify API error.
 */
router.get('/songPopular', getPopularTracksController);


router.get('/my', getUserThreadController);
/**
 * @swagger
 * /thread/my:
 *   get:
 *     summary: "사용자의 여행 스레드 조회 (커서 기반 페이지네이션 포함)"
 *     description: "사용자가 작성한 스레드를 조회합니다. 무한 스크롤을 위한 커서 기반 페이지네이션이 포함되어 있습니다."
 *     tags:
 *       - Thread
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: "JWT 토큰 (Bearer {token}) 형식"
 *       - name: cursor
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: "페이지네이션을 위한 커서 값 (optional)"
 *     responses:
 *       200:
 *         description: "성공적으로 스레드를 가져옴"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                   description: "요청 성공 여부"
 *                   example: true
 *                 code:
 *                   type: string
 *                   description: "응답 코드"
 *                   example: "2000"
 *                 message:
 *                   type: string
 *                   description: "처리 결과 메시지"
 *                   example: "사용자 스레드 조회 성공"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       postContent:
 *                         type: string
 *                         description: "게시물 내용"
 *                         example: "스웨거 테스트 용 내용"
 *                       postDate:
 *                         type: string
 *                         format: date-time
 *                         description: "게시물 작성 날짜"
 *                         example: "2025-02-14T15:00:00.000Z"
 *                       threadId:
 *                         type: integer
 *                         description: "게시물 ID"
 *                         example: 90
 *                       imageURL:
 *                         type: string
 *                         nullable: true
 *                         description: "게시물 이미지 URL (없으면 null)"
 *                         example: "https://travelbox-bucket.s3.ap-northeast-2.amazonaws.com/image/example.jpg"
 *                 cursor:
 *                   type: string
 *                   nullable: true
 *                   description: "다음 페이지 요청을 위한 커서 값"
 *                   example: "2025-02-14|90"
 *       401:
 *         description: "인증 실패 (토큰 없음 또는 유효하지 않음)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: "서버 내부 오류"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */


export default router;
