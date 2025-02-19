import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

// eslint-disable-next-line import/prefer-default-export
export const elastic = new Client({
  node: process.env.ELASTIC_SEARCH,
  auth: {
    apiKey: process.env.ELASTIC_SEARCH_API!,
  },
});
