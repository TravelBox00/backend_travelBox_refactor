/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */
import { ResultSetHeader, RowDataPacket } from 'mysql2'; // ResultSetHeader 타입 임포트
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { pool } from '../configs/database/mysqlConnect.ts'; // DB 연결 설정
import { regions, updatePostDTO, userPostDTO } from './dto/thread.dto.ts';
import { elastic } from '../configs/database/elasticConnect.ts';
import s3 from '../configs/s3.ts';
import { getArtist } from '../api/spotify.ts';


// 게시물 좋아요 상태
export const checkLikeStatus = async (
  threadId: number,
  userTag: string
): Promise<boolean> => {
  const query = `
    SELECT COUNT(*) AS likeCount 
    FROM \`Like\` l
    INNER JOIN User u ON l.userId = u.userId
    WHERE l.threadId = ? AND u.userTag = ?;
  `;

  const [rows] = await pool.query<RowDataPacket[]>(query, [threadId, userTag]);
  const likeCount = rows[0].likeCount as number;

  return likeCount > 0;
};

// 좋아요 추가
export const addLike = async (threadId: number, userTag: string) => {
  const query = `
  INSERT INTO \`Like\` (threadId, userId)
  SELECT ?, userId FROM User WHERE userTag = ?;
`;
  await pool.query(query, [threadId, userTag]);
};

// 좋아요 삭제
export const removeLike = async (threadId: number, userTag: string) => {
  const query = `
    DELETE l FROM \`Like\` l
    INNER JOIN User u ON l.userId = u.userId
    WHERE l.threadId = ? AND u.userTag = ?;
  `;
  await pool.query(query, [threadId, userTag]);
};

// 게시물 스크랩 상태
export const checkScrapStatus = async (
  threadId: number,
  userTag: string
): Promise<boolean> => {
  const query = `
    SELECT COUNT(*) AS scrapCount 
    FROM PostScrap ps
    INNER JOIN User u ON ps.userId = u.userId
    WHERE ps.threadId = ? AND u.userTag = ?;
  `;

  const [rows] = await pool.query<RowDataPacket[]>(query, [threadId, userTag]);
  return rows[0].scrapCount > 0;
};

// 스크랩 추가
export const addScrap = async (threadId: number, userTag: string) => {
  const query = `
    INSERT INTO PostScrap (threadId, userId)
    SELECT ?, userId FROM User WHERE userTag = ?;
  `;
  await pool.query(query, [threadId, userTag]);
};

// 스크랩 삭제
export const removeScrap = async (threadId: number, userTag: string) => {
  const query = `
    DELETE ps FROM PostScrap ps
    INNER JOIN User u ON ps.userId = u.userId
    WHERE ps.threadId = ? AND u.userTag = ?;
  `;
  await pool.query(query, [threadId, userTag]);
};

// 스크랩한 게시물 목록
export const getScrappedThreads = async (
  userTag: string
): Promise<
  Array<{
    threadId: number;
    postContent: string;
    userNickname: string;
    isScrapped: boolean;
    photoUrl: string;
  }>
> => {
  const query = `
    SELECT 
      t.threadId,
      t.postContent,
      u.userNickname,
      CASE WHEN ps.scrapId IS NOT NULL THEN 1 ELSE 0 END AS isScrapped, 
      i.imageInfoId AS photoUrl 
    FROM PostScrap ps
    INNER JOIN TravelThread t ON ps.threadId = t.threadId
    INNER JOIN User u ON ps.userId = u.userId
    LEFT JOIN Image i ON t.threadId = i.threadId
    WHERE u.userTag = ?;
  `;

  const [rows] = await pool.query<RowDataPacket[]>(query, [userTag]);

  return rows.map((row) => ({
    threadId: row.threadId,
    postContent: row.postContent,
    userNickname: row.userNickname,
    isScrapped: !!row.isScrapped,
    photoUrl: row.photoUrl || '',
  })) as Array<{
    threadId: number;
    postContent: string;
    userNickname: string;
    isScrapped: boolean;
    photoUrl: string;
  }>;
};

// 이미지 업로드 Model
export const uploadImageModel = {
  saveImage: async (
    threadId: number | null,
    imageURL: string
  ): Promise<any> => {
    console.log('POST saveImage');

    const query = `
      INSERT INTO Image (threadId, imageURL)
      VALUES (?, ?); 
    `;

    // 이미지 정보 DB에 저장
    const [result]: [ResultSetHeader, any[]] = await pool.query(query, [
      threadId,
      imageURL,
    ]);

    // 저장된 이미지의 imageId 반환
    return {
      imageId: result.insertId, // 삽입된 imageId를 반환
      threadId,
      imageURL,
    };
  },

  // threadId로 이미지를 조회하는 함수
  getImagesByThreadId: async (threadId: number): Promise<any[]> => {
    const query = `
      SELECT * 
      FROM Image 
      WHERE threadId = ?;
    `;

    // threadId에 해당하는 이미지들을 조회
    const [results] = await pool.query(query, [threadId]);

    return results as any[]; // 이미지 리스트 반환
  },
};

// 게시물 업로드 Model
export const upLoadPostModel = {
  createThread: async (
    userTag: string,
    postData: userPostDTO,
  ): Promise<any> => {
    console.log('Creating new thread');
    console.log('User Tag:', userTag);

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // userTag를 이용해 userId 조회
      const userQuery = `SELECT userId FROM User WHERE userTag = ? FOR UPDATE`;
      const [userResult]: [any[], any] = await connection.query(userQuery, [userTag]);

      if (userResult.length === 0) {
        throw new Error('User not found');
      }
      const { userId } = userResult[0];

      // 지역 코드 파싱
      let postRegionCode = [];
      const regionInput = postData.postRegionCode.trim(); // 입력 예시: "서울 강남" or "오세아니아 호주"
      console.log('Region Input:', regionInput); // Debug log

      // 공백을 기준으로 나누기 (예: "서울" + "강남" or "오세아니아" + "호주")
      const splitRegion = regionInput.split(/\s+/); // 여러 공백을 하나의 구분자로 처리
      const cityOrContinent = splitRegion[0]; 
      const areaOrCountry = splitRegion.slice(1).join(' '); 

      // 해당 도시가 국내 regions에 있는지 확인
      const domesticRegion = regions.domestic.find(region => region.city === cityOrContinent);

      // 해외 지역인 경우
      const overseasRegion = regions.overseas.find(region => region.continent === cityOrContinent);
      const isOverseasCountry = overseasRegion ? overseasRegion.countries.includes(areaOrCountry) : false;

      if (domesticRegion) {
        // 국내 지역인 경우
        const area = areaOrCountry;
        if (area && !domesticRegion.areas.includes(area)) {
          throw new Error(`Invalid area '${area}' for the city '${cityOrContinent}'`);
        }

        postRegionCode = area ? [cityOrContinent, area] : [cityOrContinent, ...domesticRegion.areas];
      } else if (isOverseasCountry) {
        postRegionCode = [cityOrContinent, areaOrCountry];
      } else {
        throw new Error(`Invalid region input: City or Continent '${cityOrContinent}' not found`);
      }

      // 새로운 게시물 생성
      const threadQuery = `
        INSERT INTO TravelThread 
        (userId, clothId, postCategory, postContent, postRegionCode, postDate)
        VALUES (?, ?, ?, ?, ?, ?)`; 

      const [threadResult]: [ResultSetHeader, any[]] = await connection.query(
        threadQuery,
        [
          userId,
          postData.clothId || null,
          postData.postCategory,
          postData.postContent,
          postRegionCode.join(','), // 배열 형태로 DB에 저장
          postData.postDate,
        ]
      );

      const threadId = threadResult.insertId;
      console.log(`Thread created with threadId: ${threadId}`);

      try {
        // ElasticSearch에 데이터 추가
        const elasticDoc = {
          threadId,
          category: postData.postCategory,
          postContent: postData.postContent.split(' '),
          postRegionCode: postRegionCode.join(','), 
          postDate: postData.postDate.toISOString(),
          likes: 0,
          comments: 0,
        };
        
        console.log('ElasticSearch Document:', elasticDoc);

        await elastic.index({
          index: 'post_stats',
          id: threadId.toString(),
          document: elasticDoc,
        });
      } catch (elasticError) {
        console.error('ElasticSearch indexing error:', elasticError);
      }

      await connection.commit();
      return { threadId };
    } catch (error: any) {
      await connection.rollback();
      console.error('Error creating thread:', error);
      throw error; // 원래 에러를 그대로 전달
    } finally {
      connection.release();
    }
  },
};

// 게시물 상세 조회 API
export const postInfoModel = async (
  userTag: string,
  threadId: number
): Promise<any> => {
  try {
    console.log('POST Model Connected');

    const query = `
      SELECT T.clothId, T.postCategory, T.postContent, 
         DATE_FORMAT(T.postDate, "%Y-%m-%d") as postDate, 
         T.postRegionCode, I.imageURL as imageURL, U.userTag, S.singInfo
      FROM TravelThread T
      JOIN User U ON T.userId = U.userId
      LEFT JOIN Image I ON T.threadId = I.threadId
      LEFT JOIN Sing S ON T.ThreadId = S.threadId
      WHERE U.userTag LIKE ? COLLATE utf8mb4_general_ci 
      AND T.threadId = ? AND T.isDelete = 1;
    `;

    // 부분 일치를 위해 userTag를 '%'로 감싸서 전달
    const [results] = await pool.query(query, [`%${userTag}%`, threadId]);

    console.log('Post Info Model Results:', results);

    return results;
  } catch (error) {
    console.error('게시물 상세 조회 Model Error', error);
    throw new Error('게시물 상세 조회 Model Error');
  }
};

// 게시물 검색 Model
export const postSearchModel = async (
  searchKeyword: string,
  limit: number,
  offset: number
): Promise<any> => {
  try {
    // ElasticSearch 검색
    const { hits } = await elastic.search({
      index: 'post_stats',
      size: limit,
      from: offset,
      query: {
        multi_match: {
          query: searchKeyword,
          fields: ['postContent'],
          fuzziness: 'AUTO',
        },
      },
    });

    const elasticResults = hits.hits.map((hit: any) => ({
      threadId: hit._id,
      postContent: hit._source.postContent,
      postDate: hit._source.postDate,
      postRegionCode: hit._source.postRegionCode,
      likes: hit._source.likes,
      comments: hit._source.comments,
    }));

    // MySQL 검색
    const mysqlQuery = `
      SELECT T.threadId, T.postContent, DATE_FORMAT(T.postDate, "%Y-%m-%d") as postDate, I.imageURL
      FROM TravelThread T
      LEFT JOIN Image I ON T.threadId = I.threadId
      WHERE T.postContent LIKE ?
      LIMIT ? OFFSET ?;
    `;

    // MySQL 검색 실행
    const [mysqlResults]: any[] = await pool.query(mysqlQuery, [
      `%${searchKeyword}%`,
      limit,
      offset,
    ]);

    // MySQL 결과가 배열인지 확인 후 변환
    const mysqlResultsArray = Array.isArray(mysqlResults) ? mysqlResults : [];

    // 두 결과를 병합 (ElasticSearch 결과를 우선)
    const combinedResults = [...elasticResults, ...mysqlResultsArray];

    return combinedResults;
  } catch (error) {
    console.error('검색 오류:', error);
    throw new Error('검색 실패');
  }
};

// 내가 쓴 글 조회 (이미지, 제목만)
export const myPostSearchModel = async (userTag: string): Promise<any> => {
  try {
    console.log('POST myPostSearchModel Connected');

    const query = `
      SELECT I.imageURL as imageURL, T.postContent, T.postDate, U.userTag
      FROM TravelThread T
      LEFT JOIN Image I ON T.threadId = I.threadId
      LEFT JOIN User U ON T.userId = U.userId
      WHERE T.userId = (SELECT userId FROM User WHERE userTag = ?) AND (T.isDelete = 1);
    `;

    // 배열 디스트럭처링 -> 각 객체의 속성값을 접근할 수 있음
    const [results] = await pool.query(query, [userTag]);

    return results;
  } catch (error) {
    console.error('My Post Search Model Error', error);
    throw new Error('My Post Search Model Error');
  }
};

// Category 별로 조회
export const myPostCategoryModel = async (
  myCategory: string,
  userTag: string
): Promise<any> => {
  try {
    console.log('POST myPostCategoryModel Connected');

    const query = `
      SELECT T.postContent, I.imageURL as imageURL
      FROM TravelThread T
      LEFT JOIN Image I ON T.threadId = I.threadId
      WHERE T.postCategory = ? AND T.userId = (SELECT userId FROM User WHERE userTag = ?) AND T.isDelete = 1;
    `;

    const [results] = await pool.query(query, [myCategory, userTag]);

    return results;
  } catch (error) {
    console.error('My Post Category Model Error', error);
    throw new Error('My Post Category Model Error');
  }
};

// 포스트 수정 Model
export const updatePostModel = async (
  userTag: string,
  threadId: number,
  postData: updatePostDTO
): Promise<any> => {
  try {
    console.log('PATCH updatePostModel Connected');

    // userTag와 threadId값을 확인하는 로직
    const userQuery = `SELECT userId FROM User WHERE userTag = ?;`;
    const [userResult]: any = await pool.query(userQuery, [userTag]);

    if (userResult.length === 0) {
      throw new Error(`userTag(${userTag})가 존재하지 않음.`);
    }

    const { userId } = userResult[0]; // userId 값 가져오기

    // threadId가 존재하는지 확인
    const threadQuery = `SELECT threadId FROM TravelThread WHERE userId = ? AND threadId = ?;`;
    const [threadResult]: any = await pool.query(threadQuery, [
      userId,
      threadId,
    ]);

    if (threadResult.length === 0) {
      throw new Error(`threadId(${threadId})가 존재하지 않음.`);
    }

    // 게시물 수정
    const updateQuery = `
      UPDATE TravelThread
      SET postCategory = ?, postContent = ?
      WHERE userId = ? AND threadId = ?;
    `;

    const [updateResult]: any = await pool.query(updateQuery, [
      postData.postCategory,
      postData.postContent,
      userId,
      threadId,
    ]);

     const splitContent = (content: string) => content.split(' ');

     const elasticDoc = {
       category: postData.postCategory,
       postContent: splitContent(postData.postContent),
     };
 
     // ElasticSearch에 데이터 업데이트 (PATCH 역할)
     await elastic.update({
       index: 'post_stats',
       id: threadId.toString(),
       doc: elasticDoc,  // 변경할 데이터
     });

    console.log(`threadId=${threadId} ElasticSearch 업데이트 완료`);

    return updateResult;
  } catch (error: any) {
    console.error('Update Post Model Error', error.message);
    throw new Error(error.message || 'Update Post Model Error');
  }
};

// 게시물 삭제 Model
export const deletePostModel = async (
  userTag: string,
  threadId: number
): Promise<any> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction(); // 트랜잭션 시작

    console.log('DELETE deletePostModel Connected');

    // userTag와 threadId값을 확인하는 로직
    const userQuery = `SELECT userId FROM User WHERE userTag = ?;`;
    const [userResult]: any = await connection.query(userQuery, [userTag]);

    if (userResult.length === 0) {
      throw new Error(`userTag(${userTag})가 존재하지 않음.`);
    }

    const { userId } = userResult[0]; // userId 값 가져오기

    // threadId가 존재하는지 확인
    const threadQuery = `SELECT threadId FROM TravelThread WHERE userId = ? AND threadId = ?;`;
    const [threadResult]: any = await connection.query(threadQuery, [
      userId,
      threadId,
    ]);

    if (threadResult.length === 0) {
      throw new Error(`threadId(${threadId})가 존재하지 않음.`);
    }

    // 먼저 문서 존재 여부 확인
    const checkDocument = await elastic.search({
      index: 'post_stats',
      body: {
        query: {
          match: {
            threadId,
          },
        },
      },
    });

    console.log('검색 결과:', checkDocument.hits.hits);

    // ElasticSearch에서 해당 게시물 삭제
    const response = await elastic.deleteByQuery({
      index: 'post_stats',
      body: {
        query: {
          bool: {
            must: [{ term: { threadId } }], 
          },
        },
      },
      refresh: true,
    });

    // 삭제된 문서 수를 확인하고 로그 출력
    if (response && response.deleted !== undefined && response.deleted > 0) {
      console.log(
        `ElasticSearch에서 threadId ${threadId} 삭제 완료. 삭제된 문서 수: ${response.deleted}`
      );
    } else {
      console.log(
        `ElasticSearch에서 threadId ${threadId} 삭제 실패 또는 해당 문서 없음.`
      );
    }

    // 댓글 삭제
    const deleteCommentsQuery = `DELETE FROM Comment WHERE threadId = ?;`;
    await connection.query(deleteCommentsQuery, [threadId]);

    // 해시태그 삭제
    const deleteHashTagsQuery = `DELETE FROM HashTag WHERE threadId = ?;`;
    await connection.query(deleteHashTagsQuery, [threadId]);

    // 좋아요 삭제
    const deleteLikesQuery = `DELETE FROM \`Like\` WHERE threadId = ?;`;
    await connection.query(deleteLikesQuery, [threadId]);

    // 스크랩 삭제
    const deleteScrapQuery = `DELETE FROM PostScrap WHERE threadId = ?;`;
    await connection.query(deleteScrapQuery, [threadId]);

    // Sing 삭제
    const deleteSingQuery = `DELETE FROM Sing WHERE threadId = ?;`;
    await connection.query(deleteSingQuery, [threadId]);

    // 이미지 URL 조회 (삭제할 이미지를 가져오기 위해)
    const imageQuery = `SELECT imageURL FROM Image WHERE threadId = ?;`;
    const [imageResult]: any = await connection.query(imageQuery, [threadId]);

    if (imageResult.length > 0) {
      // 이미지 삭제 (S3에서)
      for (const image of imageResult) {
        const { imageURL } = image;

        // URL을 디코딩
        const decodedURL = decodeURIComponent(imageURL);

        // URL에서 파일명 추출 (마지막 '/' 이후의 부분이 파일명)
        const fileName = decodedURL.substring(decodedURL.lastIndexOf('/') + 1);

        const params = {
          Bucket: process.env.AWS_BUCKET, // S3 버킷 이름
          Key: `image/${fileName}`, // 이미지 경로 (URL에서 추출한 파일명)
        };

        // S3에서 이미지 삭제
        await s3.send(new DeleteObjectCommand(params)); // v3 방식에서는 send 메서드를 사용
        console.log(`S3에서 이미지 삭제 완료: ${fileName}`);
      }
    }

    // 게시물 삭제 (이미지 먼저 삭제)
    const deleteImageQuery = `DELETE FROM Image WHERE threadId = ?;`;
    await connection.query(deleteImageQuery, [threadId]);

    // 게시물 삭제
    const deleteQuery = `DELETE FROM TravelThread WHERE userId = ? AND threadId = ?;`;
    const [deleteResult]: any = await connection.query(deleteQuery, [
      userId,
      threadId,
    ]);

    // 커밋
    await connection.commit();
    return deleteResult;
  } catch (error: any) {
    await connection.rollback(); // 롤백
    console.error('Delete Post Model Error', error.message);
    throw new Error(error.message || 'Delete Post Model Error');
  } finally {
    connection.release(); // 연결 해제
  }
};


// 인기 게시물 조회 Model
export const popularPostModel = async (
  page: number,
  limit: number
): Promise<any> => {
  try {
    console.log('GET popularPostModel Connected');

    const offset = (page - 1) * limit;

    const query = `
      SELECT T.threadId, 
       T.postContent, 
       DATE_FORMAT(T.postDate, "%Y-%m-%d") as postDate, 
       I.imageURL,
       (COALESCE(L.likeCount, 0) * 1 + COALESCE(C.commentCount, 0) * 1 + COALESCE(S.scrapCount, 0) * 1) AS totalEngagement
    FROM TravelThread T
    LEFT JOIN Image I ON T.threadId = I.threadId
    LEFT JOIN (
      SELECT threadId, COUNT(*) AS likeCount
      FROM \`Like\`
      GROUP BY threadId
      ) L ON T.threadId = L.threadId
    LEFT JOIN (
      SELECT threadId, COUNT(*) AS commentCount
      FROM Comment
      GROUP BY threadId
    ) C ON T.threadId = C.threadId
    LEFT JOIN (
      SELECT threadId, COUNT(*) AS scrapCount
      FROM PostScrap
      GROUP BY threadId
    ) S ON T.threadId = S.threadId
    WHERE T.isDelete = 1
    ORDER BY totalEngagement DESC
    LiMIT ? OFFSET ?;`;

    const [results] = await pool.query(query, [limit, offset]);

    return results as any[];
  } catch (error) {
    console.error('Popular Post Model Error', error);
    throw new Error('Popular Post Model Error');
  }
};

export const getSpotifySongModel = async (
  songName: string,
  limit : number,
  search_type : string
): Promise<any> => {
  try {
      console.log('Get Spotify Song Model - Song Name:', songName);

      // 찾은 Track ID로 상세 정보 조회
      const spotifyData = await getArtist(songName, limit, search_type);

      const trackInfo = {
        trackURL : spotifyData.tracks[0].external_urls
      };

      return trackInfo;
  } catch (error: any) {
      console.error('Spotify Model Error:', error.message);
      throw error;
  }
};


// threadId와 songInfo를 저장
export const addSongToThread = async (
  threadId: string,
  songInfoArray: any[],
): Promise<any> => {
  if (!songInfoArray || songInfoArray.length === 0) {
    console.error('No song info provided in songInfoArray');
    throw new Error('No song info provided');
  }

  const songInfo = songInfoArray[0]; // 선택된 곡만 사용
  if (!songInfo.external_urls || !songInfo.external_urls.spotify) {
    console.error('Spotify URL is missing for song:', songInfo);
    throw new Error('Spotify URL is missing');
  }

  const trackUrl = songInfo.external_urls.spotify;

  // 1. Sing 테이블에 삽입
  const [insertSong]: any = await pool.query(
    'INSERT INTO Sing (threadId, singInfo) VALUES (?, ?)',
    [threadId, trackUrl] // trackUrl을 삽입
  );

  const singId = insertSong.insertId;

  // 2. TravelThread 테이블에 singId 업데이트
  await pool.query(
    'UPDATE TravelThread SET singId = ? WHERE threadId = ?',
    [singId, threadId]
  );

  console.log(`Song inserted with singId: ${singId}`);

  return { message: 'Song added to thread successfully' };
};


export const getFollowingPostModel = async ( 
  userTag : string
): Promise<any> => {

  console.log("getFollowingPostModel Connected");

  try {
    const userQuery = `SELECT userId FROM User WHERE userTag = ?;`;
    const [userResult] : any = await pool.query(userQuery, [userTag]);

    if (userResult.length === 0) {
      throw new Error(`userTag(${userTag})가 존재하지 않음.`);
    }
    const userId = userResult[0].userId;
    

    const followQuery = `SELECT followingUserId FROM Follow WHERE followerUserID = ?;`;
    const [followingUserId] : any = await pool.query(followQuery, [userId]);


    const followingUserIdArray = followingUserId.map((item : any) => item.followingUserId);

    const threadsQuery = `
      SELECT T.postContent, I.imageURL, U.userTag 
      FROM TravelThread T
      LEFT JOIN Image I ON T.threadId = I.threadId
      LEFT JOIN User U ON T.userId = U.userId
      WHERE U.userId IN (?) AND T.isDelete = 1
      ORDER BY T.postDate DESC;
    `;

      const [results] = await pool.query(threadsQuery, [followingUserIdArray]);

      return results;
  } catch (error : any) {
    console.error('getFollowingPostModel Error', error.message);
    throw error;
  }
};