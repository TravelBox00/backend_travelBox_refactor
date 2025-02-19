import { elastic } from '../configs/database/elasticConnect.ts';
// Elasticsearch에서 인기있는 검색 결과를 가져오기 위한 함수
const popularElasticsearch = async (
  category?: string,
  region?: string,
  cursor?: string[]
): Promise<number[]> => {
  const mustQueries = category ? [{ match: { category } }] : [];
  const filterQueries = region ? [{ term: { postRegionCode: region } }] : [];
  const size = cursor ? 2 : 8; // 초기 요청 시 8개, 커서가 있을 때는 2개

  try {
    const response = await elastic.search({
      index: 'post_stats',
      size,
      body: {
        query: {
          bool: {
            must: mustQueries,
            filter: filterQueries,
          },
        },
        sort: [
          { postDate: { order: 'desc' } },
          { threadId: { order: 'desc' } }, // 정렬 기준 추가
        ],
        search_after: cursor, // 이전 결과 다음의 데이터를 조회
      },
    });

    return response.hits.hits.map((hit: any) => hit._source.threadId);
  } catch (error) {
    console.error('Error fetching threads from Elasticsearch:', error);
    throw new Error('Failed to fetch threads due to Elasticsearch error');
  }
};

export const getTopRankedThreads = async (
  cursor?: string[]
): Promise<number[]> => popularElasticsearch(undefined, undefined, cursor);

export const getRegionTopRankedThreads = async (
  region: string,
  cursor?: string[]
): Promise<number[]> => popularElasticsearch(undefined, region, cursor);

export const getCategoryFilterRankedThreads = async (
  category: string,
  cursor?: string[]
): Promise<number[]> => popularElasticsearch(category, undefined, cursor);

export const getFilterRankedThreads = async (
  category: string,
  region: string,
  cursor?: string[]
): Promise<number[]> => popularElasticsearch(category, region, cursor);
