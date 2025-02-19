/* eslint-disable import/prefer-default-export */
import { Request, Response, NextFunction } from 'express';
// eslint-disable-next-line import/extensions
import * as calendarService from './calendar.service.ts';
import { CustomError, errors } from '../middlewares/error.middleware.ts';

// 일정 추가
export const addCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { travelTitle, travelContent, travelStartDate, travelEndDate } =
      req.body;

    // eslint-disable-next-line prefer-destructuring
    const userTag = req.body.userTag;

    if (!userTag || !travelTitle) {
      console.error('Missing required fields:', { userTag, travelTitle });
      throw new CustomError(
        errors.NOT_INPUT_VALUE,
        new Error('UserTag and TravelTitle are required')
      );
    }

    const result = await calendarService.addCalendar({
      userTag,
      travelTitle,
      travelContent: travelContent || null,
      travelStartDate,
      travelEndDate,
    });

    if (!result || !result.travelId) {
      throw new CustomError(
        errors.CALENDAR_CREATION_FAILED,
        new Error('Database Error')
      );
    }

    res.status(200).json({
      isSuccess: true,
      result: { travelId: result.travelId },
    });
  } catch (error) {
    next(error);
  }
};

// 일정 삭제
export const removeCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { travelId } = req.body;

    if (!travelId) {
      res.status(400).json({ message: 'travelId는 필수 입력값입니다.' });
      return;
    }

    const result = await calendarService.removeCalendar(travelId);

    if (result.affectedRows === 0) {
      throw new CustomError(
        errors.CALENDAR_NOT_FOUND,
        new Error('Calendar Not Found')
      );
    }

    res.status(200).json({ isSuccess: true });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 일정 수정
export const fixCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      travelId,
      travelTitle,
      travelContent,
      travelStartDate,
      travelEndDate,
    } = req.body;

    if (!travelId) {
      res.status(400).json({ message: 'travelId는 필수 입력값입니다.' });
      return;
    }

    const result = await calendarService.fixCalendar({
      travelId,
      travelTitle,
      travelContent,
      travelStartDate,
      travelEndDate,
    });

    if (result.affectedRows === 0) {
      throw new CustomError(
        errors.CALENDAR_NOT_FOUND,
        new Error('Calendar Not Found')
      );
    }

    res.status(200).json({ isSuccess: true });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 내 일정 조회
export const getMySchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userTag, date } = req.query;

    if (!userTag || !date) {
      res.status(400).json({
        isSuccess: false,
        message: 'userTag와 date는 필수 입력값입니다.',
      });
      return;
    }

    const schedules = await calendarService.getMySchedule(
      userTag as string,
      date as string
    );

    res.status(200).json({
      isSuccess: true,
      result: schedules,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
