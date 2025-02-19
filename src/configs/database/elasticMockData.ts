/* eslint-disable import/extensions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Client } from '@elastic/elasticsearch';
import mysql from 'mysql2/promise';
import { pool } from './mysqlConnect';
import { elastic } from './elasticConnect';

const INDEX_NAME = 'post_stats';

async function syncPostToElastic(threadId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rows]: any = await pool.execute(
    'SELECT postTitle, postContent FROM TravelThread WHERE threadId = ?',
    [threadId]
  );

  if (rows.length === 0) {
    console.error(`❌ threadId=${threadId}에 해당하는 게시물이 없음`);
    return;
  }

  const title = rows[0].postTitle;
  const postContent = rows[0].postContent
    .split(/\s+/)
    .map((word: string) => word.trim()); // 뛰어쓰기(`Whitespace`) 기준으로 배열 변환

  await elastic.index({
    index: 'post_stats',
    id: threadId.toString(),
    document: { threadId, title, postContent, likes: 0, comments: 0 },
  });

  console.log(
    `✅ Elasticsearch에 게시물 저장: threadId=${threadId}, title="${title}"`
  );
}

async function deletePostSentence(threadId: number, sentenceToDelete: string) {
  await elastic.update({
    index: INDEX_NAME,
    id: threadId.toString(),
    script: {
      source:
        'ctx._source.postContent.remove(ctx._source.postContent.indexOf(params.sentenceToDelete));',
      params: { sentenceToDelete },
    },
  });

  console.log(
    `✅ 게시물 내용 삭제: threadId=${threadId}, sentenceToDelete="${sentenceToDelete}"`
  );
}

// 🚀 실행
deletePostSentence(12345, '첫 번째 문장');

async function likeThread(threadId: number) {
  await elastic.update({
    index: INDEX_NAME,
    id: threadId.toString(),
    script: { source: 'ctx._source.likes += 1' },
  });

  console.log(`✅ 좋아요 추가: threadId=${threadId}`);
}

async function addComment(threadId: number) {
  await elastic.update({
    index: INDEX_NAME,
    id: threadId.toString(),
    script: { source: 'ctx._source.comments += 1' },
  });

  console.log(`✅ 댓글 추가: threadId=${threadId}`);
}
