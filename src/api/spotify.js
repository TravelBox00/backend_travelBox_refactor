import axios from 'axios';
import qs from 'qs';
import dev from '../config/dev';

// Spotify API credentials
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken = '';
let tokenExpiresAt = 0;

/**
 * Spotify API 토큰 요청 함수
 */
async function getSpotifyToken() {
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      qs.stringify({ grant_type: 'client_credentials' }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: { username: SPOTIFY_CLIENT_ID, password: SPOTIFY_CLIENT_SECRET },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000; // 만료 시간 설정
    console.log('🔑 새 토큰 발급:', accessToken);

    return accessToken;
  } catch (error) {
    console.error('❌ 토큰 요청 실패:', error.response ? error.response.data : error.message);
    throw error;
  }
}

/**
 * Spotify 아티스트 정보 가져오기
 */
async function getArtistInfo(artistId) {
  if (!accessToken || Date.now() >= tokenExpiresAt) {
    await getSpotifyToken();
  }

  try {
    const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log('🎵 아티스트 정보:', response.data); // 데이터가 옴 response
    // console.log("response data", response);
  } catch (error) {
    console.error('❌ 아티스트 정보 요청 실패:', error.response ? error.response.data : error.message);
  }
}

// Axios 응답 인터셉터 - 토큰 만료 시 자동 갱신
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.log('🔄 토큰 만료, 재발급 중...');
      await getSpotifyToken();
      return axios(error.config); // 원래 요청 재시도
    }
    return Promise.reject(error);
  }
);

// 실행 예시
const artistId = '4Z8W4fKeB5YxbusRsdQVPb'; // Radiohead
getArtistInfo(artistId);
