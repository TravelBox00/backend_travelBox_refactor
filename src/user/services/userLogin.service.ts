// eslint-disable-next-line import/no-extraneous-dependencies
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import { CustomError, errors } from '../../middlewares/error.middleware.ts';
import { generateTokens } from '../../middlewares/auth.middleware.ts';

import {
  deleteRefreshTokenInRedis,
  findUserByUserTag,
  getRefreshTokenFromRedis,
  storeRefreshTokenInRedis,
  getUserInfoByUserTag,
} from '../models/userLogin.model.ts';
import loginReqDto from '../dto/login.dto.ts';
import { refreshTokenDto, tokensDto } from '../dto/token.dto.ts';
import getUserInfo from '../dto/userInfo.dto.ts';

export const loginService = async (
  userLoginInfo: loginReqDto
): Promise<tokensDto> => {
  const { userTag, userPassword } = userLoginInfo;

  // user 정보 맞는지 확인
  const userInfo = await findUserByUserTag(userTag);
  if (!userInfo) throw new CustomError(errors.NOT_FOUND_USER_TAG, new Error()); // custom error 적용시키기

  const firstHash = crypto
    .createHash('blake2b512')
    .update(userPassword)
    .digest('hex');
  const isPasswordValid = await bcrypt.compare(
    firstHash,
    userInfo.userPassword
  );
  if (!isPasswordValid)
    throw new CustomError(errors.INVALID_PASSWORD, new Error()); // custom error 적용시키기

  // eslint-disable-next-line no-use-before-define
  const { accessToken, refreshToken } = await handleTokenOperations(
    userInfo.userTag
  );

  const userTokenInfo: tokensDto = {
    userTag,
    accessToken,
    refreshToken,
  };
  return userTokenInfo;
};

export const refreshTokenService = async (
  userRefreshToken: refreshTokenDto
): Promise<tokensDto> => {
  const { refreshToken, userTag } = userRefreshToken;
  // const storedToken = await getRefreshTokenFromS3(userTag);
  const storedToken = await getRefreshTokenFromRedis(userTag);
  if (!storedToken || storedToken !== refreshToken) {
    throw new CustomError(errors.INVALID_TOKEN, new Error());
  }

  if (!storedToken || storedToken !== refreshToken) {
    throw new CustomError(errors.INVALID_TOKEN, new Error());
  }

  // eslint-disable-next-line no-use-before-define
  const newToken = await handleTokenOperations(userTag);

  const userTokenInfo: tokensDto = {
    userTag,
    accessToken: newToken.accessToken,
    refreshToken: newToken.refreshToken,
  };

  return userTokenInfo;
};

const handleTokenOperations = async (userTag: string) => {
  const tokens = generateTokens(userTag);

  if (!tokens) {
    // 500번 인데 이렇게 하는게 맞는지 잘 모르겠음
    throw new Error();
  }
  const { accessToken, refreshToken } = tokens;

  const userRefreshToken = { userTag, refreshToken };

  // S3에 refreshToken 저장
  // await storeRefreshTokenInS3(userRefreshToken);
  await storeRefreshTokenInRedis(userRefreshToken);
  return { accessToken, refreshToken };
};

// 로그아웃 (S3에서 토큰 삭제)
export const logoutService = async (userTag: string) => {
  // const success: boolean = await deleteRefreshTokenInS3(userTag)
  const success = await deleteRefreshTokenInRedis(userTag);
  if (success === 0) {
    throw new CustomError(errors.NOT_FOUND_USER_TAG, new Error());
  }
};

export const userInfoService = async (
  userTag: string
): Promise<getUserInfo> => {
  const userAllInfo: getUserInfo = await getUserInfoByUserTag(userTag);
  if (!userAllInfo)
    throw new CustomError(errors.NOT_FOUND_USER_TAG, new Error());
  return userAllInfo;
};
