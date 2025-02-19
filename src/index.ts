/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Router } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

import { swaggerUi, swaggerSpec } from './configs/swagger.ts';
import { authenticateToken } from './middlewares/auth.middleware.ts';
import { errorHandler } from './middlewares/error.middleware.ts';

import userRoutes from './user/user.route.ts';
import calendarRoutes from './calendar/calendar.route.ts';
import threadRoutes from './thread/thread.route.ts';
import searchRoutes from './search/search.route.ts';
import commentRouter from './comment/comment.route.ts';
import followRouter from './follow/follow.route.ts';

dotenv.config();

const app = express();
const port = process.env.PORT;

const router = Router();
router.get('/', (req: any, res: { send: (arg0: string) => void }) => {
  res.send('Welcome to the TravelBox!');
});

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan('dev'));

// api 문서
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 라우터
app.use('/', router);
app.use('/users', userRoutes);

app.use('/calendar', authenticateToken, calendarRoutes);
app.use('/thread', authenticateToken, threadRoutes);
app.use('/search', authenticateToken, searchRoutes);
app.use('/comment', authenticateToken, commentRouter);
app.use('/follow', authenticateToken, followRouter);

// 에러 처리 미들웨어 적용
app.use(errorHandler);
// 서버 실행
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
