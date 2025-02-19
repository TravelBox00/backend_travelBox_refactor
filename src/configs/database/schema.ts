import { pool } from './mysqlConnect.ts';

// eslint-disable-next-line import/prefer-default-export
export const createTables = async () => {
  const connection = pool;

  // User Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS User (
      userId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userPassword VARCHAR(255) NOT NULL,
      userNickname VARCHAR(50) NOT NULL,
      userTag VARCHAR(50) NOT NULL UNIQUE
      email TEXT,
      userExist Boolean DEFAULT TRUE NOT NULL,
    );
  `);

  // TravelThread Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS TravelThread (
      threadId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      clothId INT,
      singId INT,
      postCategory ENUM('여행기록', '기념품', '여행지', '여행 코디') NOT NULL,
      postTitle VARCHAR(255) NOT NULL,
      postContent TEXT NOT NULL,
      postDate DATE NOT NULL,
      postRegionCode INT,
      FOREIGN KEY (userId) REFERENCES User(userId),
      FOREIGN KEY (clothId) REFERENCES Cloth(clothId),
      FOREIGN KEY (singId) REFERENCES Sing(singId)
    );
  `);

  // TravelCalendar Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS TravelCalendar (
      travelId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      travelTitle VARCHAR(255),
      travelContent TEXT,
      travelStartDate DATE,
      travelEndDate DATE,
      FOREIGN KEY (userId) REFERENCES User(userId)
    );
  `);

  // Comment Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS Comment (
      commentId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      threadId INT NOT NULL,
      commentContent TEXT NOT NULL,
      commentVisible ENUM('public', 'private') NOT NULL,
      commentDate DATE NOT NULL,
      FOREIGN KEY (userId) REFERENCES User(userId),
      FOREIGN KEY (threadId) REFERENCES TravelThread(threadId)
    );
  `);

  // Like Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`Like\`(
      likeId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      threadId INT NOT NULL,
      userId INT NOT NULL,
      FOREIGN KEY (threadId) REFERENCES TravelThread(threadId),
      FOREIGN KEY (userId) REFERENCES User(userId)
    );
  `);

  // Follow Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS Follow (
      followId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      followingUserId INT NOT NULL,
      followerUserId INT NOT NULL,
      FOREIGN KEY (userId) REFERENCES User(userId),
      FOREIGN KEY (followingUserId) REFERENCES User(userId),
      FOREIGN KEY (followerUserId) REFERENCES User(userId)
    );
  `);

  // PostScrap Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS PostScrap (
      scrapId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      threadId INT NOT NULL,
      FOREIGN KEY (userId) REFERENCES User(userId),
      FOREIGN KEY (threadId) REFERENCES TravelThread(threadId)
    );
  `);

  // Cloth Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS Cloth (
      clothId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      threadId INT NOT NULL,
      clothInfo TEXT NOT NULL,
      FOREIGN KEY (threadId) REFERENCES TravelThread(threadId)
    );1
  `);

  // Sing Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS Sing (
      singId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      threadId INT NOT NULL,
      singInfo TEXT NOT NULL,
      FOREIGN KEY (threadId) REFERENCES TravelThread(threadId)
    );
  `);

  // Image Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS Image (
      imageId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      threadId INT NOT NULL,
      imageURL TEXT NOT NULL,
      FOREIGN KEY (threadId) REFERENCES TravelThread(threadId)
    );
  `);

  // HashTag Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS HashTag (
      hashtagId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      threadId INT NOT NULL,
      hashtagContent VARCHAR(50) NOT NULL,
      hashtagNumber VARCHAR(50) NOT NULL,
      FOREIGN KEY (threadId) REFERENCES TravelThread(threadId)
    );
  `);

  console.log('Tables created successfully!');
  await connection.end();
};
// Add this at the end of your file
createTables();
