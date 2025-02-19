import { Response } from 'express';
import { searchFollowerModel, searchFollowingModel, showFollowerModel, showFollowingModel, userAddFollowModel } from './follow.model.ts';

export const userAddFollowService = async (
    userTag : string,
    followTag : string
): Promise<any> => {
    console.log('userAddFollowService Connected');

    const result = userAddFollowModel(userTag, followTag);

    return result;
};

export const showFollowerService = async (
    userTag : string
): Promise<any> => {
    console.log('showFollowerService Connected');

    const result = showFollowerModel(userTag);

    return result;
};

// Following 보기
export const showFollowingService = async (
    userTag : string
): Promise<any> => {
    console.log('showFollowingService Connected');

    const result = showFollowingModel(userTag);

    return result;
};

export const searchFollowerService = async (
    myTag : string,
    follower : string
): Promise<any> => {
    console.log('searchFollowService Connected');

    const result = searchFollowerModel(myTag, follower);

    return result;
};

export const searchFollowingService = async (
    myTag : string,
    following : string
): Promise<any> => {
    console.log('searchFollowService Connected');

    const result = searchFollowingModel(myTag, following);

    return result;
};