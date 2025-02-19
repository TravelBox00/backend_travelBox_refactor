/* eslint-disable eqeqeq */
import crypto from 'crypto';
// eslint-disable-next-line import/no-extraneous-dependencies
import bcrypt from 'bcrypt';

import { signupReqDto } from '../dto/signup.dto.ts';
import {
  changeIsDeletedByUserTag,
  findUserTagByUserTag,
  userInfoChangeByUserTag,
  userInfoRegisterByUserTag,
} from '../models/userSign.model.ts';
import { CustomError, errors } from '../../middlewares/error.middleware.ts';
import modifyReqDto from '../dto/modify.dto.ts';
import {
  checkEmail,
  checkNickname,
  checkPassword,
} from '../utils/loginValidate.ts';
import {
  deleteRefreshTokenInRedis,
  findUserBackByUserTag,
} from '../models/userLogin.model.ts';

export const signupService = async (userInfo: signupReqDto) => {
  const { userTag, userPassword, userNickname, email, userProfileImage } =
    userInfo;

  const promises = [checkNickname(userNickname), checkPassword(userPassword)];

  if (email !== undefined) {
    promises.push(checkEmail(email));
  }

  await Promise.all(promises);

  const salt: string = await bcrypt.genSalt(10);
  const firstHash: string = crypto
    .createHash('blake2b512')
    .update(userPassword)
    .digest('hex');
  const hashedPassword: string = await bcrypt.hash(firstHash, salt);
  await userInfoRegisterByUserTag({
    userTag,
    hashedPassword,
    userNickname,
    userProfileImage,
    email,
  });
};

export const duplicateService = async (userTag: string) => {
  let duplicate = false;
  const CheckUserTag: number = await findUserTagByUserTag(userTag);

  // eslint-disable-next-line eqeqeq
  if (CheckUserTag == 1) {
    duplicate = true;
  }
  return duplicate;
};

export const signoutService = async (userTag: string) => {
  const deleteCount: number = await changeIsDeletedByUserTag(userTag);
  const success = await deleteRefreshTokenInRedis(userTag);
  if (deleteCount == 0 || success == 0) {
    throw new CustomError(errors.NOT_FOUND_USER_TAG, new Error());
  }
};

export const modifyService = async (userInfo: modifyReqDto) => {
  const { userTag, userPassword, userNickname } = userInfo;
  const user = await findUserTagByUserTag(userTag);
  let hashedPassword: string | undefined;
  if (!user) {
    throw new CustomError(errors.NOT_FOUND_USER_TAG, new Error());
  }

  if (userPassword) {
    await checkPassword(userPassword);
    const firstHash: string = crypto
      .createHash('blake2b512')
      .update(userPassword)
      .digest('hex');
    hashedPassword = await bcrypt.hash(firstHash, 10);
  }

  if (userNickname) {
    await checkNickname(userNickname);
  }
  if (!userPassword && !userNickname) {
    throw new CustomError(errors.NOT_INPUT_VALUE, new Error());
  }
  await userInfoChangeByUserTag(
    userTag,
    hashedPassword || undefined,
    userNickname || undefined
  );
};

export const backService = async (
  userTag: string,
  userPassword: string
): Promise<void> => {
  // user 정보 맞는지 확인
  const userInfo = await findUserBackByUserTag(userTag);
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

  const check = await changeIsDeletedByUserTag(userTag);
  if (!check) {
    throw new CustomError(errors.NOT_FOUND_USER_TAG, new Error());
  }
};
