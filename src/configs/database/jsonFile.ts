/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import fs from 'fs';
import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

const elastic = new Client({
  node: process.env.ELASTIC_SEARCH,
  auth: { apiKey: process.env.ELASTIC_SEARCH_API! },
});

/**
 * ✅ JSON 데이터 Elasticsearch에 업로드
 */
const uploadRegionsToElastic = async () => {
  try {
    // 1. JSON 파일 읽기
    const rawData = fs.readFileSync('filter.json', 'utf8');
    console.log(rawData);
    const data = JSON.parse(rawData);

    // 2. 국내 데이터 업로드
    for (const region of data.domestic) {
      const { city, areas } = region;
      for (const area of areas) {
        await elastic.index({
          index: 'region_suggestions',
          document: {
            type: 'domestic',
            country: '한국',
            city,
            area,
            region_hierarchy: ['한국', city, area], // ✅ 계층 구조로 저장
          },
        });
      }
    }

    // 3. 해외 데이터 업로드
    for (const region of data.overseas) {
      const { continent, countries } = region;
      for (const country of countries) {
        await elastic.index({
          index: 'region_suggestions',
          document: {
            type: 'overseas',
            continent,
            country,
            region_hierarchy: [continent, country],
          },
        });
      }
    }

    console.log('✅ 지역 데이터 업로드 완료');
  } catch (error) {
    console.error('❌ 지역 데이터 업로드 실패:', error);
  }
};

// 🚀 실행
uploadRegionsToElastic();
