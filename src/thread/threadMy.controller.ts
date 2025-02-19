import { NextFunction, Request, Response } from 'express';

import myThread from './dto/myThread.dto.ts';
import { decodeTokenUserTag } from '../middlewares/auth.middleware.ts';
import getMyThread from './threadMy.service.ts';

const getUserThreadController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1] as string;
    const userTag: string = decodeTokenUserTag(token) as string;
    const cursor = (req.query.cursor as string) || undefined; // 클라이언트가 전송한 마지막 게시물의 커서, 없으면 undefined

    const myThreads: myThread[] = await getMyThread(userTag, cursor);
    res.status(200).json({
      result: myThreads,
      cursor: myThreads.length
        ? `${myThreads[myThreads.length - 1].postDate}|${myThreads[myThreads.length - 1].id}`
        : null,
      isSuccess: true,
    });
  } catch (error) {
    next(error);
  }
};

export default getUserThreadController;
