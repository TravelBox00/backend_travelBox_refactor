import { NextFunction, Request, Response } from 'express';
import loginReqDto from '../dto/login.dto.ts';
import {
  loginService,
  logoutService,
  refreshTokenService,
  userInfoService,
} from '../services/userLogin.service.ts';
import { refreshTokenDto, tokensDto } from '../dto/token.dto.ts';
import { decodeTokenUserTag } from '../../middlewares/auth.middleware.ts';
import getUserInfo from '../dto/userInfo.dto.ts';

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const loginReq: loginReqDto = req.body;
    const loginRes: tokensDto = await loginService(loginReq);

    res.status(200).json({ result: loginRes, isSuccess: true });
  } catch (error) {
    next(error);
  }
};

export const refreshTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshTokenReq: refreshTokenDto = req.body;
    const newAccessToken: tokensDto =
      await refreshTokenService(refreshTokenReq);

    res.status(200).json({ result: newAccessToken, isSuccess: true });
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1] as string;
    const userTag: string = decodeTokenUserTag(token) as string;
    await logoutService(userTag);

    res.status(200).json({ isSuccess: true });
  } catch (error) {
    next(error);
  }
};

export const userInfoController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1] as string;
    const userTag: string = decodeTokenUserTag(token) as string;
    const resUserInfo: getUserInfo = await userInfoService(userTag);

    res.status(200).json({ result: resUserInfo, isSuccess: true });
  } catch (error) {
    next(error);
  }
};
