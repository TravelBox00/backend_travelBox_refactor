/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-extraneous-dependencies */
import { Response, NextFunction } from 'express';
import { Upload } from '@aws-sdk/lib-storage';
import s3 from '../configs/s3.ts';
import {
  deletePostModel,
  myPostCategoryModel,
  myPostSearchModel,
  popularPostModel,
  postInfoModel,
  postSearchModel,
  updatePostModel,
  uploadImageModel,
  upLoadPostModel,
} from './thread.model.ts';
import { updatePostDTO, userPostDTO } from './dto/thread.dto.ts';

import * as threadModel from './thread.model.ts';
import { getArtist } from '../api/spotify.ts';
import { v4 as uuidv4 } from 'uuid';

// 게시물 좋아요
export const toggleLike = async (
  threadId: number,
  userTag: string
): Promise<{ message: string; isLiked: boolean }> => {
  try {
    const isLiked = await threadModel.checkLikeStatus(threadId, userTag);

    if (isLiked) {
      // 좋아요 취소
      await threadModel.removeLike(threadId, userTag);
      return { message: '좋아요 취소', isLiked: false };
    }

    // 좋아요 추가
    await threadModel.addLike(threadId, userTag);
    return { message: '좋아요 성공', isLiked: true };
  } catch (error) {
    console.error(`Error in toggleLike: ${error}`);
    return { message: '에러 발생', isLiked: false };
  }
};

// 게시물 스크랩
export const toggleScrap = async (
  threadId: number,
  userTag: string
): Promise<{ message: string; isScrapped: boolean }> => {
  try {
    const isScrapped = await threadModel.checkScrapStatus(threadId, userTag);

    if (isScrapped) {
      // 스크랩 취소
      await threadModel.removeScrap(threadId, userTag);
      return { message: '스크랩 취소', isScrapped: false };
    }

    // 스크랩 추가
    await threadModel.addScrap(threadId, userTag);
    return { message: '스크랩 성공', isScrapped: true };
  } catch (error) {
    console.error(`Error in toggleScrap: ${error}`);
    return { message: '에러 발생', isScrapped: false };
  }
};

// 스크랩한 게시물 목록
export const getScrappedThreads = async (
  userTag: string
): Promise<{
  message: string;
  scrappedThreads: Array<{
    threadId: number;
    postContent: string;
    userNickname: string;
    isScrapped: boolean;
    photoUrl: string;
  }>;
}> => {
  try {
    const scrappedThreads = await threadModel.getScrappedThreads(userTag);
    return {
      message: '스크랩 목록 조회 성공',
      scrappedThreads,
    };
  } catch (error) {
    console.error(`Error in getScrappedThreads: ${error}`);
    throw new Error('스크랩 목록 조회 실패');
  }
};

// 이미지 업로드 및 DB에 저장하는 서비스 함수
export const uploadImageService = async (
  threadId: number,
  files: Express.Multer.File[]
): Promise<{ locations: string[]; imageIds: number[] }> => {
  console.log('POST uploadImageService');

  if (!files || files.length === 0) {
    throw new Error('파일이 업로드되지 않았습니다.');
  }

  const bucketName = process.env.AWS_BUCKET;
  if (!bucketName) {
    throw new Error('S3 버킷이 설정되지 않았습니다.');
  }

  try {
    // 1. 파일 업로드
    const uploadPromises = files.map((file) => {
      // 고유한 파일 이름 생성 (예: originalname-UUID)
      const uniqueFileName = `${file.originalname}-${uuidv4()}`;

      const params = {
        Bucket: bucketName,
        Key: `image/${uniqueFileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const upload = new Upload({ client: s3, params });
      return upload.done();
    });

    const results = await Promise.all(uploadPromises);
    const imageLocations = results
      .map((result: any) => result.Location)
      .filter((location) => location);

    // 2. 이미지 정보 DB 저장
    const imageIds = [];
    for (const location of imageLocations) {
      const imageInfoId = location; // S3에서 얻은 이미지 URL을 imageInfoId로 사용
      const imageInfo = await uploadImageModel.saveImage(threadId, imageInfoId);
      imageIds.push(imageInfo.imageId);
    }

    return { locations: imageLocations, imageIds };
  } catch (error) {
    console.error('이미지 업로드 및 저장 중 오류 발생:', error);
    throw new Error('이미지 업로드 및 저장 실패');
  }
};

// 게시물 업로드 서비스
export const upLoadPostService = async (
  userTag: string,
  postData: userPostDTO,
  files: Express.Multer.File[],
  res: Response,
  next: NextFunction,
): Promise<any> => {
  console.log('POST upLoadPostService: Service Started');

  try {
    // 1. Thread 생성
    const threadResponse = await upLoadPostModel.createThread(userTag, postData);

    const { threadId } = threadResponse;

    if (!threadId) {
      throw new Error('Thread creation failed');
    }

    // 2. 이미지 업로드
    const imageResponse = await uploadImageService(threadId, files);

    const selectedSongInfo = await getArtist(postData.songName, 10, 'track'); // 클라이언트에서 선택된 노래 정보

    if (selectedSongInfo && selectedSongInfo.tracks && selectedSongInfo.tracks.length > 0) {
      await threadModel.addSongToThread(threadId, selectedSongInfo.tracks);
    }
    
    return {
      success: true,
      message: 'Post upload success',
      threadId,
      imageLocations: imageResponse.locations
    };
  } catch (error) {
    console.error('POST upLoadPostService: Error occurred', error);
    throw error;
  }
};

// 포스트 상세 조회 서비스 함수
export const postInfoService = async (
  userTag: string,
  threadId: number,
  res: Response,
  next: NextFunction
): Promise<any> => {
  console.log('POST postInfoService Connected');

  try {
    const thread = await postInfoModel(userTag, threadId);

    if (!thread) {
      return res.status(400).json({ error: 'Post Info Failed' });
    }

    return thread;
  } catch (error) {
    console.error('Post Info Service Error', error);
    return next(error);
  }
};

// 검색어에 따른 포스트 조회 서비스 함수
export const postSearchService = async (
  searchKeyword: string,
  limit: number,
  offset: number
): Promise<any> => {
  try {
    console.log('postSearch Service Connected');

    const threads = await postSearchModel(searchKeyword, limit, offset);

    if (!threads) {
      return [];
    }

    return threads;
  } catch (error) {
    console.error('Post Search Service Error', error);
    throw error;
  }
};

// 내가 쓴 글 확인 서비스 함수 (제목, 이미지만)
export const myPostSearchService = async (userTag: string): Promise<any> => {
  try {
    console.log('POST myPostSearchService Connected');

    const threads = await myPostSearchModel(userTag);

    if (!threads) {
      return [];
    }

    return threads;
  } catch (error) {
    console.error('My Post Search Service Error', error);
    throw new Error('My Post Search Service Error');
  }
};

// Category 별로 조회 서비스 함수
export const myPostCategoryService = async (
  myCategory: string,
  userTag: string
): Promise<any> => {
  try {
    console.log('POST myPostCategoryService Connected');

    const threads = await myPostCategoryModel(myCategory, userTag);

    if (!threads || threads.length === 0) {
      return [];
    }

    return threads;
  } catch (error) {
    console.error('My Post Category Service Error', error);
    throw new Error('My Post Category Service Error');
  }
};

// 포스트 수정 서비스 함수
export const updatePostService = async (
  userTag: string,
  threadId: number,
  postData: updatePostDTO
): Promise<any> => {
  try {
    console.log('PUT updatePostService Connected');

    const result = await updatePostModel(userTag, threadId, postData);

    return result;
  } catch (error: any) {
    console.error('Update Post Service Error', error.message);
    throw new Error(error.message || 'Update Post Service Error');
  }
};

// 포스트 삭제 서비스 함수
export const deletePostService = async (
  userTag: string,
  threadId: number
): Promise<any> => {
  try {
    console.log('DELETE deletePostService Connected');

    const result = await deletePostModel(userTag, threadId);

    return result;
  } catch (error) {
    console.error('Delete Post Service Error', error);
    throw new Error('Delete Post Service Error');
  }
};

// 인기 게시물 조회 서비스 함수
export const popularPostService = async (
  page: number,
  limit: number
): Promise<any> => {
  try {
    console.log('GET popularPostService Connected');

    const threads = await popularPostModel(page, limit);

    if (!threads) {
      return [];
    }

    return threads;
  } catch (error) {
    console.error('Popular Post Service Error', error);
    throw new Error('Popular Post Service Error');
  }
};


export const getSpotifySongService = async (
  songName : string,
  limit : number,
  search_type : string
): Promise<any> => {
    console.log('Get Spotify Song Service');

    const result = await threadModel.getSpotifySongModel(songName, limit, search_type);

    if(!result) {
      return [];
    }
    
    return result;
};


export const getFollowingPostService = async (
  userTag : string
): Promise<any> => {
    console.log("getFollowService Connected");

    const result = await threadModel.getFollowingPostModel(userTag);

    if(!result) {
      [];
    }

    return result;
}