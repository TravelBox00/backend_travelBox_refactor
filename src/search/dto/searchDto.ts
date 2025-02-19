export class searchResDto {
  threadId: number;

  imageURL: string;

  postTitle: string;

  postDate: Date;

  constructor(
    threadId: number,
    imageURL: string,
    postTitle: string,
    postDate: Date
  ) {
    this.threadId = threadId;
    (this.imageURL = imageURL),
      (this.postTitle = postTitle),
      (this.postDate = postDate);
  }
}
