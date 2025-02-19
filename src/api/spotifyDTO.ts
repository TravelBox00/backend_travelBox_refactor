export interface SpotifyArtist {
  name: string;
}

export interface SpotifyImage {
  url : string;
}

export interface SpotifyTrack {
  name: string;
  external_urls: {
    spotify: string;
  };
  artists: SpotifyArtist[];
}

export interface SpotifyTrackItem {
  track: SpotifyTrack; // 'track' 속성으로 `SpotifyTrack`을 포함
}

export interface SpotifyResponse {
  tracks?: {
    items: SpotifyTrack[]; // 'items' 배열 안에 `SpotifyTrackItem`이 포함됨
  };
}