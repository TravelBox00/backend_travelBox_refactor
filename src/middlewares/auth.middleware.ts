/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
import dotenv from 'dotenv';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

// 액세스 & 리프레시 토큰 생성
// eslint-disable-next-line consistent-return
export const generateTokens = (userTag: string) => {
  try {
    const accessToken = jwt.sign({ userTag }, JWT_SECRET, { expiresIn: '3d' });
    const refreshToken = jwt.sign({ userTag }, JWT_SECRET, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error(error);
  }
};

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return; // Promise<void> 반환
  }

  // jwt.verify를 프로미스로 감싸 처리
  try {
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });

    req.body.userTag = (decoded as any).userTag; // decoded 정보를 사용하여 필요한 작업 수행
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};
/*
사용 방법
app.get('/users', authenticateToken, (req, res) => {});
*/

export const decodeTokenUserTag = (token: string) => {
  try {
    const decoded = jwt.decode(token);
    const { userTag } = decoded as JwtPayload;
    return userTag;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};
