/* eslint-disable import/prefer-default-export */
import bcrypt from 'bcrypt';
import { pool } from './mysqlConnect.ts';

export const insertMockData = async () => {
  const connection = await pool.getConnection();

  try {
    const password = 'password3188';
    const nickname = 'ljm';
    const tag = 'ljm#123';

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 데이터베이스에 저장
    const query = `
        INSERT INTO User (userPassword, userNickname, userTag)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        userPassword=VALUES(userPassword), userNickname=VALUES(userNickname);
    `;
    await connection.execute(query, [hashedPassword, nickname, tag]);

    // Insert into User Table
    await connection.query(`
      INSERT INTO User (userPassword, userNickname, userTag) VALUES 
      ('password123', 'JohnDoe', 'john#123'),
      ('password456', 'JaneSmith', 'jane#456'),
      ('password789', 'AliceJohnson', 'alice#789')
      ON DUPLICATE KEY UPDATE 
        userPassword=VALUES(userPassword), 
        userNickname=VALUES(userNickname);
    `);

    // Insert into TravelThread Table (required before Cloth and Sing)
    await connection.query(`
      INSERT INTO TravelThread (userId, postCategory, postTitle, postContent, postDate, postRegionCode) VALUES 
      (1, '여행기록', 'My First Trip', 'It was amazing!', '2025-01-01', 101),
      (2, '기념품', 'Cool Souvenirs', 'Check out what I got!', '2025-01-02', 102),
      (3, '여행 코디', 'Travel Outfit', 'Here is my style!', '2025-01-03', 103);
    `);

    // Insert into Cloth Table
    await connection.query(`
      INSERT INTO Cloth (threadId, clothInfo) VALUES 
      (1, 'Casual T-shirt and Jeans'),
      (2, 'Summer Dress'),
      (3, 'Winter Jacket');
    `);

    // Insert into Sing Table
    await connection.query(`
      INSERT INTO Sing (threadId, singInfo) VALUES 
      (1, 'Popular Song 1'),
      (2, 'Popular Song 2'),
      (3, 'Popular Song 3');
    `);

    // Insert into TravelCalendar Table
    await connection.query(`
      INSERT INTO TravelCalendar (userId, travelTitle, travelContent, travelStartDate, travelEndDate) VALUES 
      (1, 'Summer Vacation', 'Plan for summer vacation.', '2025-07-01', '2025-07-10'),
      (2, 'Winter Getaway', 'Escape the cold.', '2025-12-01', '2025-12-07');
    `);

    // Insert into Comment Table
    await connection.query(`
      INSERT INTO Comment (userId, threadId, commentContent, commentVisible, commentDate) VALUES 
      (1, 1, 'Great post!', 'public', '2025-01-05'),
      (2, 2, 'Awesome souvenirs!', 'public', '2025-01-06');
    `);

    // Insert into Like Table
    await connection.query(`
      INSERT INTO \`Like\` (threadId, userId) VALUES 
      (1, 2),
      (2, 3);
    `);

    // Insert into Follow Table
    await connection.query(`
      INSERT INTO Follow (userId, followingUserId, followerUserId) VALUES 
      (1, 2, 3),
      (2, 3, 1);
    `);

    // Insert into PostScrap Table
    await connection.query(`
      INSERT INTO PostScrap (userId, threadId) VALUES 
      (1, 1),
      (2, 2);
    `);

    // Insert into Image Table
    await connection.query(`
      INSERT INTO Image (threadId, imageInfoId) VALUES 
      (1, 101),
      (2, 102);
    `);

    // Insert into HashTag Table
    await connection.query(`
      INSERT INTO HashTag (threadId, hashtagContent, hashtagNumber) VALUES 
      (1, 'Travel', '001'),
      (2, 'Souvenirs', '002'),
      (3, 'Style', '003');
    `);

    console.log('Mock data inserted successfully!');
  } catch (error) {
    console.error('Error inserting mock data:', error);
  } finally {
    await connection.release();
  }
};

// Add this at the end of your file
insertMockData();
