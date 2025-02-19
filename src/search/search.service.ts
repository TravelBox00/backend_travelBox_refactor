import { CustomError, errors } from '../middlewares/error.middleware.ts';
import { searchResDto } from './dto/searchDto.ts';
import {
  getThread,
  getImage,
  searchValidSuggestions,
  getFastTimeThread,
} from './search.model.ts';
import {
  getCategoryFilterRankedThreads,
  getFilterRankedThreads,
  getRegionTopRankedThreads,
  getTopRankedThreads,
} from './searchPopul.model.ts';

export const searchService = async (
  word: string,
  cursor?: string
): Promise<searchResDto[]> => {
  const threadIds = await getFastTimeThread(word, cursor);
  if (threadIds.length === 0) {
    throw new CustomError(errors.NOT_FOUND_WORD, new Error());
  }

  // 스레드와 이미지 URL을 병렬로 가져오기
  const threads = await Promise.all(threadIds.map((id) => getThread(id)));
  const imageUrls = await Promise.all(threadIds.map((id) => getImage(id)));

  // 스레드와 해당 이미지 URL 매핑
  const searchData = threads.map((thread, index) => ({
    threadId: thread.threadId,
    imageURL: imageUrls[index],
    postTitle: thread.title,
    postDate: thread.date,
  }));

  return searchData;
};

export const wordService = async (word: string): Promise<string[]> => {
  const words: string[] = await searchValidSuggestions(word);
  if (words.length === 0) {
    throw new CustomError(errors.NOT_FOUND_WORD, new Error());
  }

  const uniqueWords = Array.from(new Set(words.flat()));
  return uniqueWords;
};

export const filterService = async (
  category: string | undefined,
  region: string | undefined,
  cursor?: string[]
): Promise<searchResDto[]> => {
  let threadIds: number[];

  if (category !== undefined && region !== undefined) {
    threadIds = await getFilterRankedThreads(category, region, cursor);
  } else if (category === undefined && region !== undefined) {
    threadIds = await getRegionTopRankedThreads(region, cursor);
  } else if (category !== undefined && region === undefined) {
    threadIds = await getCategoryFilterRankedThreads(category, cursor);
  } else {
    threadIds = await getTopRankedThreads(cursor);
  }

  if (threadIds.length === 0) {
    throw new CustomError(errors.NOT_FOUND_WORD, new Error());
  }

  const threads = await Promise.all(threadIds.map((id) => getThread(id)));
  const imageUrls = await Promise.all(threadIds.map((id) => getImage(id)));

  const searchData = threads.map((thread, index) => ({
    threadId: thread.threadId,
    imageURL: imageUrls[index],
    postTitle: thread.title,
    postDate: thread.date,
  }));

  return searchData;
};
