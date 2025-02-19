export class signupReqDto {
  userTag: string;

  userPassword: string;

  userNickname: string;

  userProfileImage: string;

  email?: string;

  constructor(
    userTag: string,
    userPassword: string,
    userNickname: string,
    userProfileImage: string,
    email?: string
  ) {
    this.userTag = userTag;
    this.userPassword = userPassword;
    this.userNickname = userNickname;
    this.email = email;
    this.userProfileImage = userProfileImage;
  }
}

export class hashedSignupDto {
  userTag: string;

  hashedPassword: string;

  userNickname: string;

  userProfileImage: string;

  email?: string;

  constructor(
    userTag: string,
    hashedPassword: string,
    userNickname: string,
    userProfileImage: string,
    email?: string
  ) {
    this.userTag = userTag;
    this.hashedPassword = hashedPassword;
    this.userNickname = userNickname;
    this.email = email;
    this.userProfileImage = userProfileImage;
  }
}

export class signupResDto {
  userTag: string;

  success: boolean;

  constructor(userTag: string, success: boolean) {
    this.userTag = userTag;
    this.success = success;
  }
}
