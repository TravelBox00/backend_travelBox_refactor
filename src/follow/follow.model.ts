import { pool } from "../configs/database/mysqlConnect.ts";
import { Response } from "express";

export const userAddFollowModel = async (
    userTag: string,
    followTag: string
): Promise<any> => {
    console.log("userAddFollowModel Connected");

    try {
        // 현재 사용자 ID 조회
        const [userIdArray]: any = await pool.query(
            `SELECT userId FROM User WHERE userTag = ?`, 
            [userTag]
        );

        if (userIdArray.length === 0) {
            throw new Error(`userTag '${userTag}' not found`);
        }
        const userId: number = userIdArray[0].userId;

        // 팔로우할 사용자 ID 조회
        const [followIdArray]: any = await pool.query(
            `SELECT userId FROM User WHERE userTag = ?`, 
            [followTag]
        );

        if (followIdArray.length === 0) {
            throw new Error(`followTag '${followTag}' not found`);
        }

        const followId: number = followIdArray[0].userId;

        const delete_check = await deleteUserFollowModel(followId);

        if(delete_check === 0) {
            return {message : `followid '${followId}' is deleted User`};
        }

        // 이미 팔로우 중인지 확인
        const [existingFollow]: any = await pool.query(
            `SELECT followId FROM Follow 
             WHERE followingUserId = ? AND followerUserId = ?`,
            [followId, userId]
        );

        // 이미 팔로우 중이면 삭제
        if (existingFollow.length > 0) {
            await pool.query(
                `DELETE FROM Follow 
                 WHERE followingUserId = ? AND followerUserId = ?`,
                [followId, userId]
            );
            return { message: 'Follow relationship deleted successfully' };
        }

        // 새로운 팔로우 관계 생성
        await pool.query(
            `INSERT INTO Follow (followingUserId, followerUserId) 
             SELECT ?, ? 
             WHERE NOT EXISTS (
                 SELECT 1 FROM Follow 
                 WHERE followingUserId = ? AND followerUserId = ?
             )`,
            [followId, userId, followId, userId]
        );
        return { message: 'Follow added successfully' };

    } catch (error: any) {
        console.log(error);
        throw new Error(error.message || 'userAddFollowModel error');
    }
};

// Follower LookUp Model
export const showFollowerModel = async (
    userTag : string
): Promise<any> => {
    console.log('showFollowerModel Connected');

    try {
        // userTag 디코딩 처리
        const decodedUserTag = decodeURIComponent(userTag);

        // userid 먼저 찾기
        const [userIdArray]: any = await pool.query(`SELECT userId FROM User WHERE userTag = ?`, [decodedUserTag]);

        if(userIdArray.length === 0) {
            return { message: `userAddFollowModel error: userTag '${decodedUserTag}' not found` };
        }

        const userId: number = userIdArray[0].userId;


        /* 
         * 내 팔로워 조회
         *   -> followingId로 내 id 조회 후 followedid 검색
         */


        /** 내가 그 사람을 팔로잉 하는지 여부도 추가 */
        

        const follwingquery = `
            SELECT 
                F.followerUserId, 
                U.userTag, 
                U.userProfileImage,
                CASE 
                    WHEN EXISTS (
                        SELECT 1 
                        FROM Follow 
                        WHERE followerUserId = ? AND followingUserId = F.followerUserId
                    ) THEN TRUE
                    ELSE FALSE
                END AS isFollowing
            FROM Follow F
            LEFT JOIN User U ON F.followerUserId = U.userId
            WHERE F.followingUserId = ? AND U.isDelete = 1;
        `;

        const [followerIdArray]: any = await pool.query(follwingquery, [userId, userId]);

        if(followerIdArray.length === 0) {
            return { followers : [] };
        }

        return { followers: followerIdArray };

    } catch(error : any) {
        console.log(error);
        throw new Error( error.message || 'showFollowerModel error');
    }
};


// Following Model
export const showFollowingModel = async (
    userTag : string
): Promise<any> => {
    console.log('showFollowingModel Connected');

    try {
        // userTag 디코딩 처리
        const decodedUserTag = decodeURIComponent(userTag);

        // userid 먼저 찾기
        const [userIdArray]: any = await pool.query(`SELECT userId FROM User WHERE userTag = ?`, [decodedUserTag]);

        if(userIdArray.length === 0) {
            return { message : `userAddFollowModel error: userTag '${decodedUserTag}' not found` };
        }

        const userId: number = userIdArray[0].userId;

        /* 
         * 내 팔로잉 조회
         *   -> followerId로 내 id조회 후 followingid 검색
         */


        /** 그 사람이 나를 팔로우하는지 여부 조회 */

        const followerquery = `
            SELECT 
                F.followingUserId, 
                U.userTag, 
                U.userProfileImage,
                CASE 
                    WHEN EXISTS (
                        SELECT 1 
                        FROM Follow 
                        WHERE followerUserId = F.followingUserId AND followingUserId = ?
                    ) THEN TRUE
                    ELSE FALSE
                END AS isFollowedByThem
            FROM Follow F
            LEFT JOIN User U ON F.followingUserId = U.userId
            WHERE F.followerUserId = ? AND U.isDelete = 1;
        `;

        const [followerIdArray]: any = await pool.query(followerquery, [userId, userId]);

        if(followerIdArray.length === 0) {
            return { followers : [] };
        }

        return { followers: followerIdArray };

    } catch(error : any) {
        console.log(error);
        return { message: 'showFollowingModel error' };
    }
};


export const searchFollowerModel = async (
    userTag: string,
    follower: string
  ): Promise<any> => {
    try {
      const userQuery = `SELECT userId FROM User WHERE userTag = ?;`;
      const [userArray]: any = await pool.query(userQuery, [userTag]);
  
      if (userArray.length === 0) {
        return { message: `userTag '${userTag}' not found` };
      }
      const myId = userArray[0].userId;
  
      const followQuery = `
        SELECT U.userId, U.userTag, U.userProfileImage, U.userNickname
        FROM User U
        LEFT JOIN Follow F ON U.userId = F.followerUserId
        WHERE F.followingUserId = ? AND (U.userTag = ? OR U.userNickname = ?) AND U.isDelete = 1;
      `;
      const [followArray]: any = await pool.query(followQuery, [myId, follower, follower]);
  
      if (followArray.length === 0) {
        return { message: `follower '${follower}' not found` };
      }
  
      const followerInfo = followArray[0];

      deleteUserFollowModel(followerInfo.userId);

      return {
        userId: followerInfo.userId,
        userTag: followerInfo.userTag,
        userProfileImage: followerInfo.userProfileImage,
        userNickname: followerInfo.userNickname,
      };
    } catch (error: any) {
      console.error('searchFollowerModel error:', error);
      return { message: 'searchFollowerModel error' };
    }
  };
  

  export const searchFollowingModel = async (
    userTag: string,
    following: string
  ): Promise<any> => {
    try {
      const userQuery = `SELECT userId FROM User WHERE userTag = ?;`;
      const [userArray]: any = await pool.query(userQuery, [userTag]);
  
      if (userArray.length === 0) {
        return { message: `userTag '${userTag}' not found` };
      }
      const myId = userArray[0].userId;
  
      const followQuery = `
        SELECT U.userId, U.userTag, U.userProfileImage, U.userNickname
        FROM User U
        LEFT JOIN Follow F ON U.userId = F.followingUserId
        WHERE F.followerUserId = ? AND (U.userTag = ? OR U.userNickname = ?) AND U.isDelete = 1;
      `;
      const [followArray]: any = await pool.query(followQuery, [myId, following, following]);
  
      if (followArray.length === 0) {
        return { message: `follower '${following}' not found` };
      }
  
      const followering = followArray[0];

      deleteUserFollowModel(followering.userId);

      return {
        userId: followering.userId,
        userTag: followering.userTag,
        userProfileImage: followering.userProfileImage,
        userNickname: followering.userNickname,
      };
    } catch (error: any) {
      console.error('searchFollowerModel error:', error);
      return { message: 'searchFollowerModel error' };
    }
  };
  

// 만약 사용자가 delete 되었다면 팔로우 관계도 삭제
export const deleteUserFollowModel = async (followId: number): Promise<any> => {
    try {
      const queryCheckIsExist = `SELECT isDelete FROM User WHERE userId = ?;`;
      const [isDeleteArray]: any = await pool.query(queryCheckIsExist, [followId]);
  
      if (isDeleteArray.length === 0) {
        return { status: "error", message: "User not found" };
      }
  
      const checkIsDelete = isDeleteArray[0].isDelete;
  
      if (checkIsDelete === 0) {
        const deleteFollowQuery = `
          DELETE FROM Follow 
          WHERE followerUserId = ? OR followingUserId = ?;
        `;
        await pool.query(deleteFollowQuery, [followId, followId]);
  
        return { status: "success", message: "User and related follow relationships deleted" };
      } else {
        return { status: "info", message: "User is not marked as deleted" };
      }
    } catch (error: any) {
      console.error("deleteUserFollowModel error:", error);
      return { status: "error", message: "deleteUserFollowModel error", errorDetails: error.message };
    }
  };