/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

const elastic = new Client({
  node: process.env.ELASTIC_SEARCH,
  auth: { apiKey: process.env.ELASTIC_SEARCH_API! },
});

// ✅ 띄어쓰기 단위로 `postContent`를 배열 형태로 변환
const splitContent = (content: any) => content.split(' ');

async function addTestDataToElastic() {
  for (let threadId = 92; threadId <= 99; threadId++) {
    const postTitle = `테스트 게시물 ${threadId}`;
    const postContentString = `이것은 ${threadId}번째 테스트 게시물입니다. 서울 여행 기념품 추천`;
    const postContentArray = splitContent(postContentString); // ✅ 띄어쓰기 단위로 배열 변환

    const doc = {
      threadId,
      category: '여행기록',
      postTitle,
      postContent: postContentArray, // ✅ 배열 형태로 저장
      postDate: new Date(
        Date.now() - Math.floor(Math.random() * 10000000000)
      ).toISOString(),
      postRegionCode: Math.floor(Math.random() * 100) + 1,
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
    };

    try {
      await elastic.index({
        index: 'post_stats',
        id: threadId.toString(),
        document: doc,
      });

      console.log(`✅ threadId=${threadId} 추가 완료`);
    } catch (error) {
      console.error(`❌ threadId=${threadId} 추가 실패:`, error);
    }
  }

  console.log('🎉 모든 데이터 삽입 완료!');
}

// 🚀 실행
addTestDataToElastic();
