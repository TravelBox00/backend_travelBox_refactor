import myThread from './dto/myThread.dto.ts';
import { CustomError, errors } from '../middlewares/error.middleware.ts';
import getThreads from './threadMy.model.ts';
// import { getImage } from '../search/search.model.ts';

const getMyThread = async (
  userTag: string,
  cursor?: string
): Promise<myThread[]> => {
  const limit = cursor ? 3 : 9; // 커서가 있으면 3개, 없으면 9개 로드
  const threads: myThread[] = await getThreads(userTag, limit, cursor);
  if (threads.length === 0) {
    throw new CustomError(errors.THREAD_NOT_FOUND, new Error());
  }
  return threads;
};

export default getMyThread;
