class modifyReqDto {
  userTag: string;

  userPassword?: string;

  userNickname?: string;

  constructor(userTag: string, userPassword?: string, userNickname?: string) {
    this.userTag = userTag;
    this.userPassword = userPassword;
    this.userNickname = userNickname;
  }
}

export default modifyReqDto;
