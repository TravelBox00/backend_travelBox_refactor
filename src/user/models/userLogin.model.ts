// eslint-disable-next-line import/no-extraneous-dependencies
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import Redis from 'ioredis';
import { pool } from '../../configs/database/mysqlConnect.ts';
import { refreshTokenDto } from '../dto/token.dto.ts';
import s3 from '../../configs/database/s3Connect.ts';

import loginReqDto from '../dto/login.dto.ts';
import getUserInfo from '../dto/userInfo.dto.ts';

export const findUserByUserTag = async (
  userTag: string
): Promise<loginReqDto | null> => {
  try {
    const connection = await pool.getConnection();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [[rows]]: any = await connection.execute(
      `
            SELECT userTag, userPassword
            FROM User
            WHERE userTag = ? AND isDelete = 1
            `,
      [userTag]
    );
    connection.release();
    return rows;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
};

export const storeRefreshTokenInS3 = async (
  userRefreshToken: refreshTokenDto
): Promise<boolean> => {
  try {
    const { userTag } = userRefreshToken;
    const { refreshToken } = userRefreshToken;

    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: `tokens/${userTag}.json`,
      Body: JSON.stringify({ refreshToken }),
      ContentType: 'application/json',
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const getRefreshTokenFromS3 = async (
  userTag: string
): Promise<string | null> => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: `tokens/${userTag}.json`,
    };

    const command = new GetObjectCommand(params);
    const response = await s3.send(command);

    if (!response.Body) {
      return null;
    }
    const body = await response.Body.transformToString();
    const parsedData = JSON.parse(body);
    return parsedData.refreshToken;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const deleteRefreshTokenInS3 = async (
  userTag: string
): Promise<boolean> => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: `tokens/${userTag}.json`,
    };

    const command = new DeleteObjectCommand(params);
    await s3.send(command);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const deleteRefreshTokenInRedis = async (
  userTag: string
): Promise<number | undefined> => {
  try {
    const redisClient = new Redis({
      host: process.env.REDIS_HOST, // 수정 필요
      port: 6379,
    });
    const result = await redisClient.del(userTag);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
};

export const storeRefreshTokenInRedis = async (
  userRefreshToken: refreshTokenDto
): Promise<void> => {
  try {
    const redisClient = new Redis({
      host: process.env.REDIS_HOST, // 수정 필요
      port: 6379,
    });
    const { userTag } = userRefreshToken;
    const { refreshToken } = userRefreshToken;

    await redisClient.set(userTag, refreshToken, 'EX', 3600);
    await redisClient.quit();
  } catch (error) {
    console.log(error);
    throw new Error();
  }
};

export const getRefreshTokenFromRedis = async (
  userTag: string
): Promise<string | undefined | null> => {
  try {
    const redisClient = new Redis({
      host: process.env.REDIS_HOST, // 수정 필요
      port: 6379,
    });
    const refreshToken = await redisClient.get(userTag);
    await redisClient.quit();
    return refreshToken;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
};

export const getUserInfoByUserTag = async (
  userTag: string
): Promise<getUserInfo> => {
  try {
    const connection = await pool.getConnection();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [[rows]]: any = await connection.execute(
      `
            SELECT userTag, userNickname, userProfileImage, email
            FROM User
            WHERE userTag = ?
            `,
      [userTag]
    );
    connection.release();
    return rows;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
};

export const findUserBackByUserTag = async (
  userTag: string
): Promise<loginReqDto | null> => {
  try {
    const connection = await pool.getConnection();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [[rows]]: any = await connection.execute(
      `
            SELECT userTag, userPassword
            FROM User
            WHERE userTag = ? AND isDelete = 0
            `,
      [userTag]
    );
    connection.release();
    return rows;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
};
