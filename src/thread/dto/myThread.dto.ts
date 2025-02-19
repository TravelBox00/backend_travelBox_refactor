class myThread {
  id: number;

  content: string;

  imageURL: string;

  postDate: Date;

  constructor(id: number, content: string, imageURL: string, postDate: Date) {
    this.id = id;
    this.content = content;
    this.imageURL = imageURL;
    this.postDate = postDate;
  }
}

export default myThread;
