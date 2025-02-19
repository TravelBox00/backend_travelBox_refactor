import axios from "axios";
import qs from 'qs';
import dotenv from 'dotenv';
import { SpotifyTrack, SpotifyResponse, SpotifyArtist } from './spotifyDTO';
import fs from 'fs';
import path from 'path';

dotenv.config();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

let accessToken = '';  
let tokenExpirationTime = 0;

const getAccessToken = async() => {
    try {
        const tokenUrl = "https://accounts.spotify.com/api/token";
        
        const auth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");

        console.log('Requesting new token...');
        const response = await axios.post(
            tokenUrl,
            qs.stringify({ grant_type: "client_credentials" }),
            {
                headers: {
                    "Authorization": `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            }
        );

        // 토큰 저장 확인
        accessToken = response.data.access_token;
        tokenExpirationTime = Date.now() + (response.data.expires_in * 1000);
        
        console.log('New token received:', !!accessToken);
        console.log('Token expiration set to:', new Date(tokenExpirationTime));

        return response.data;

    } catch (error: any) {
        console.error("Token error details:", error.response?.data || error.message);
        throw error;
    }
};

// 토큰 유효성 체크크
const tokenValidation = async () => {
    try {
        console.log('Validating token...');
        console.log('Current token exists:', !!accessToken);
        console.log('Current time:', new Date(Date.now()));
        console.log('Token expires:', new Date(tokenExpirationTime));

        if (!accessToken || Date.now() >= tokenExpirationTime) {
            console.log('Token needs refresh, getting new token...');
            await getAccessToken();
        } else {
            console.log('Token is valid');
        }
    } catch (error: any) {
        console.error("Token validation error:", error.message);
        throw error;
    }
};

// Spotify 요청 받는 함수
const getSpotifyRequest = async (
  url: string
): Promise<{ tracks: SpotifyTrack[] }> => {
  try {
    await tokenValidation();

    // API 요청
    const response = await axios.get<SpotifyResponse>(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.data.tracks || !response.data.tracks.items) {
      console.log("No tracks found");
      return { tracks: [] };
    }

    // 여러 트랙을 변환
    const transformedTracks = response.data.tracks.items.map((track: any) => ({
      name: track.name,
      external_urls: track.external_urls,
      artists: track.artists.map((artist: any) => ({ name: artist.name })),
    }));

    return { tracks: transformedTracks };
  } catch (error: any) {
    console.error("API request error:", error.response?.data || error.message);
    throw error;
  }
};


// Track 찾는 함수
export const getArtist = async (
    trackName: string,
    limit : number,
    search_type : string
) => {        
    if (!trackName) {
        throw new Error("Track ID is required");
    }

    const trackInfo = `https://api.spotify.com/v1/search?q=${trackName}&type=${search_type}&limit=${limit}`;

    console.log("Track info URL:", trackInfo);

    return getSpotifyRequest(trackInfo);
};

export const getPopularTracks = async (): Promise<{ tracks: SpotifyTrack[] }> => {
  // 새로운 Global TOP 50 플레이리스트 ID 사용
  const playlistId = '37i9dQZEVXbMDoHDwVN2tF';
  const playlistUrl = `https://api.spotify.com/v1/playlists/${playlistId}`;

  // 오늘자 Hit 곡 - 37i9dQZF1DXcBWIGoYBM5M
  // Global TOP 50 - 37i9dQZEVXbMDoHDwVN2t
  
  try {
    await tokenValidation();
    
    const response = await axios.get(playlistUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.data.items) {
      console.log("No tracks found in playlist");
      return { tracks: [] };
    }

    const transformedTracks = response.data.items.map((item: any) => ({
      name: item.track.name,
      external_urls: item.track.external_urls,
      artists: item.track.artists.map((artist: any) => ({ name: artist.name })),
    }));
    
    return { tracks: transformedTracks };

  } catch (error: any) {
    console.error("Error fetching Global Top 50:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    throw error;
  }
};