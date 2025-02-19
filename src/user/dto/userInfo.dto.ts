class getUserInfo {
  userTag: string;

  userNickname: string;

  userProfileImage: string;

  email: string;

  constructor(
    userTag: string,
    userNickname: string,
    userProfileImage: string,
    email: string
  ) {
    this.userTag = userTag;
    this.userNickname = userNickname;
    this.email = email;
    this.userProfileImage = userProfileImage;
  }
}

export default getUserInfo;
