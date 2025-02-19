import { NextFunction, Request, Response } from 'express';
import { filterService, searchService, wordService } from './search.service.ts';
import { searchResDto } from './dto/searchDto.ts';

export const searchController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const searchReq = req.query.word as string;
    const cursor = req.query.cursor as string | undefined;
    const searchRes: searchResDto[] = await searchService(searchReq, cursor);

    res.status(200).json({ result: searchRes, isSuccess: true });
  } catch (error) {
    next(error);
  }
};

export const wordController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const searchReq: string = req.query.word as string;
    const searchRes: string[] = await wordService(searchReq);

    res.status(200).json({ result: searchRes, isSuccess: true });
  } catch (error) {
    next(error);
  }
};

export const filterController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = req.query.category as string | undefined;
    const region = req.query.region as string | undefined;
    const cursor = req.query.cursor as string[] | undefined; // 커서 처리 추가
    const searchRes: searchResDto[] = await filterService(
      category,
      region,
      cursor
    );

    res.status(200).json({ result: searchRes, isSuccess: true });
  } catch (error) {
    next(error);
  }
};
