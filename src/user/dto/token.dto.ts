export class refreshTokenDto {
  userTag: string;

  refreshToken: string;

  constructor(userTag: string, refreshToken: string) {
    this.userTag = userTag;
    this.refreshToken = refreshToken;
  }
}

export class tokensDto {
  userTag: string;

  accessToken: string;

  refreshToken: string;

  constructor(userTag: string, accessToken: string, refreshToken: string) {
    this.userTag = userTag;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
