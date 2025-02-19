/* eslint-disable radix */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import {
  deletePostService,
  myPostCategoryService,
  myPostSearchService,
  popularPostService,
  postInfoService,
  postSearchService,
  updatePostService,
  uploadImageService,
  upLoadPostService,
} from './thread.service.ts'; // 서비스에서 작성한 업로드 함수
import { updatePostDTO, userPostDTO } from './dto/thread.dto.ts';
import { upLoadPostModel } from './thread.model.ts';
import * as threadService from './thread.service.ts';
import { CustomError, errors } from '../middlewares/error.middleware.ts';
import { getPopularTracks } from '../api/spotify.ts';
import { decodeTokenUserTag } from '../middlewares/auth.middleware.ts';

// 게시물 좋아요
export const toggleLike = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { threadId, userTag } = req.body;

    if (!threadId || !userTag) {
      throw new CustomError(errors.NOT_PROVIDED_VALUES, new Error());
    }

    const result = await threadService.toggleLike(threadId, userTag);

    res.status(200).json({
      isSuccess: true,
      code: '2000',
      message: result.isLiked ? '좋아요 성공' : '좋아요 취소',
      result: {
        isLiked: result.isLiked,
      },
    });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        isSuccess: false,
        code: error.code,
        message: error.description,
        path: error.path,
      });
    } else {
      res.status(500).json({
        isSuccess: false,
        code: errors.SERVER_ERROR.code,
        message: errors.SERVER_ERROR.description,
        result: null,
      });
    }
  }
};

// 게시물 스크랩
export const toggleScrap = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { threadId, userTag } = req.body;

    if (!threadId || !userTag) {
      throw new CustomError(errors.NOT_PROVIDED_VALUES, new Error());
    }
    const result = await threadService.toggleScrap(threadId, userTag);

    res.status(200).json({
      isSuccess: true,
      code: '2000',
      message: result.isScrapped ? '스크랩 성공' : '스크랩 취소',
      result: {
        isScrapped: result.isScrapped,
      },
    });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        isSuccess: false,
        code: error.code,
        message: error.description,
        path: error.path,
      });
    } else {
      res.status(500).json({
        isSuccess: false,
        code: errors.SERVER_ERROR.code,
        message: errors.SERVER_ERROR.description,
        result: null,
      });
    }
  }
};

// 스크랩한 게시물 목록
export const getScrappedThreads = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userTag = req.query.userTag as string;

    if (!userTag) {
      res.status(400).json({
        isSuccess: false,
        code: '4000',
        message: 'userTag를 제공해야 합니다.',
        result: null,
      });
      return;
    }

    const result = await threadService.getScrappedThreads(userTag);

    res.status(200).json({
      isSuccess: true,
      code: '2000',
      message: result.message,
      result: result.scrappedThreads,
    });
  } catch (error) {
    console.error('스크랩한 게시물 목록 API 에러:', error);
    res.status(500).json({
      isSuccess: false,
      code: '5000',
      message: '서버 오류',
      result: null,
    });
  }
};


// 게시물 업로드 Controller
export const upLoadPostController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  console.log('POST upLoadPostController');

  try {
    const token = req.headers.authorization?.split(' ')[1] as string;
    const userTag: string = decodeTokenUserTag(token) as string;

    const parsedBody = JSON.parse(req.body.body);
    const { postCategory, postContent, postRegionCode, clothId, songName} = parsedBody;

    if (
      postCategory !== '여행 기록' &&
      postCategory !== '기념품' &&
      postCategory !== '여행지' &&
      postCategory !== '여행 코디'
    ) {
      console.log('Invalid category:', postCategory);
      return res.status(400).json({
        error: 'Category must be one of 여행 기록, 기념품, 여행지, 여행 코디',
      });
    }

    const postDate = new Date();
    const postData: userPostDTO = {
      postCategory,
      postContent,
      postRegionCode,
      postDate,
      clothId,
      songName,
    };
    // 게시물 생성 및 이미지 업로드를 서비스로 통합
    const response = await upLoadPostService(
      userTag,
      postData,
      req.files as Express.Multer.File[],
      res,
      next,
    );
    return res.status(201).json(response);
  } catch (error: any) {
    console.error('Post Upload Controller Error', error.message);
    return res.status(400).json({ error: error.message || 'Post Upload Controller Error' });
  }
};

// 포스트 상세 조회 Controller
export const postInfoController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userTag = req.query.userTag as string;
    const threadId = Number(req.query.threadId);

    const result = await postInfoService(userTag, threadId, res, next);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Post Info Controller Error', error);
    res.status(400).json({ error: 'Post Info Controller Error' });
    throw new Error('Post Info Controller Error');
  }
};

// 검색어에 따른 포스트 조회 Controller
export const postSearchController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    console.log('POST search controller connected');

    const searchKeyword = req.query.searchKeyword as string;
    const limit = 10; // 정해진 값
    let offset = 0;

    console.log('searchKeyword:', searchKeyword);

    if (!searchKeyword) {
      return res.status(400).json({ error: 'searchKeyword is required' });
    }

    if (req.query.offset) {
      offset = Number(req.query.offset);
    }

    const result = await postSearchService(searchKeyword, limit, offset);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Post Search Controller Error', error);
    res.status(400).json({ error: 'Post Search Controller Error' });
    throw new Error('Post Search Controller Error');
  }
};

// 내가 쓴 글 확인 Controller (제목, 이미지만)
export const myPostSearchController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    console.log('POST myPostSearchController Connected');

    const userTag = req.query.userTag as string;

    console.log('User Tag', userTag);

    const result = await myPostSearchService(userTag);

    return res.status(200).json(result);
  } catch (error) {
    console.error('my Post Search Contorller Error', error);
    res.status(400).json({ error: 'My Post Search Controller Error' });
    throw new Error('My Post Search Controller Error');
  }
};

// Category 별로 조회 Controller
export const myPostCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    console.log('POST myPostCategoryController Connected');

    let myCategory = req.query.myCategory as string;
    const userTag = req.query.userTag as string;

    // 카테고리 매핑 객체
    const categoryMapping: { [key: string]: string } = {
      '여행기록': '여행 기록',
      '여행코디': '여행 코디'
    };

    // 디코딩 후 trim() 적용
    myCategory = decodeURIComponent(myCategory).trim();

    // 매핑된 카테고리가 있으면 변환
    myCategory = categoryMapping[myCategory] || myCategory;

    console.log('Decoded My Category:', myCategory);
    console.log('User Tag:', userTag);

    const validCategories = ['여행 기록', '기념품', '여행지', '여행 코디'];
    if (!validCategories.includes(myCategory)) {
      console.log('Invalid category:', myCategory);
      return res.status(400).json({
        error: `Category is Enum, must be one of ${validCategories.join(', ')}`,
      });
    }

    const result = await myPostCategoryService(myCategory, userTag);
    return res.status(200).json(result);
  } catch (error) {
    console.error('My Post Category Controller Error', error);
    res.status(400).json({ error: 'My Post Category Controller Error' });
    throw new Error('My Post Category Controller Error');
  }
};

// 포스트 수정 Controller
export const updatePostController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  console.log('PUT updatePostController Connected');

  try {
    const token = req.headers.authorization?.split(' ')[1] as string;
    const userTag: string = decodeTokenUserTag(token) as string;
    const { threadId, postCategory ,postContent } =
      req.body;

    // 카테고리 확인인
    if (
      postCategory !== '여행 기록' &&
      postCategory !== '기념품' &&
      postCategory !== '여행지' &&
      postCategory !== '여행 코디'
    ) {
      console.log('Invalid category:', postCategory);

      return res.status(400).json({
        error:
          'Category is Enum, must be one of 여행 기록, 기념품, 여행지, 여행 코디',
      });
    }

    // postContent 내용 존재 여부 확인
    if (!postContent) {
      console.log('Invalid postContent:', postContent);
      return res.status(400).json({ error: 'postContent is required' });
    }

    const postData: updatePostDTO = {
      postCategory,
      postContent,
    };

    const result = await updatePostService(userTag, threadId, postData);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Update Post Controller Error', error.message);
    return res
      .status(400)
      .json({ error: error.message || 'Update Post Controller Error' });
  }
};

// 포스트 삭제 Controller
export const deletePostController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  console.log('DELETE deletePostController Connected');

  try {
    // URL 쿼리 파라미터에서 값 가져온 후 디코딩
    const token = req.headers.authorization?.split(' ')[1] as string;
    const userTag: string = decodeTokenUserTag(token) as string;
    const threadId = Number(req.query.threadId);

    // 포스트 삭제 서비스 호출
    const result = await deletePostService(userTag, threadId);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Delete Post Controller Error', error.message);
    return res
      .status(400)
      .json({ error: error.message || 'Delete Post Controller Error' });
  }
};

// 인기 게시물 조회 Controller
export const popularPostController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    console.log('GET popularPostController Connected');

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await popularPostService(page, limit);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Popular Post Controller Error', error);
    return res.status(400).json({ error: 'Popular Post Controller Error' });
  }
};

// Spotyfy 노래 가져오는 API
export const getSpotifySongController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
      console.log("SpotifySong Controller API");

      const songName = req.query.songName as string;
      const limit = 10; // 고정값
      const search_type = 'track';

      if (!songName) {
          return res.status(400).json({ error: 'Track ID is required' });
      }

      const result = await threadService.getSpotifySongService(songName, limit, search_type);
      return res.status(200).json(result);

  } catch (error: any) {
      console.error('getSpotifySongController Error:', error);
      return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};


// following post 조회
export const getFollowingPostController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
    console.log("get Follow Controller Connected");

    try {
      const userTag = decodeURIComponent(req.query.userTag as string);

      const result = await threadService.getFollowingPostService(userTag);

      return res.status(200).json( result );
    } catch (error : any) {
      console.error('get Follow Controller error', error);
      return res.status(500).json({ error : 'get Follow Controller error', message : error.message });
    }
};

export const getPopularTracksController = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<any>=> {
  try {
    const tracks = await getPopularTracks();
    return res.status(200).json(tracks);
  } catch (error) {
    next(error); // 에러가 발생하면 Express 에러 핸들러로 전달
  }
};