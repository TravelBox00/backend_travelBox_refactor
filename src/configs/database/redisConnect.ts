/* eslint-disable import/prefer-default-export */
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Redis 클라이언트 생성
export const redisClient = new Redis({
  host: process.env.REDIS_HOST, // 수정 필요
  port: 6379,
});
