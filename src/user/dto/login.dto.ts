class loginReqDto {
  userTag: string;

  userPassword: string;

  constructor(userTag: string, userPassword: string) {
    this.userTag = userTag;
    this.userPassword = userPassword;
  }
}

export default loginReqDto;
