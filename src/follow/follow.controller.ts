import { Response, Request, NextFunction } from "express";
import { searchFollowerService, searchFollowingService, showFollowerService, showFollowingService, userAddFollowService } from "./follow.service.ts";
import { decodeTokenUserTag } from "../middlewares/auth.middleware.ts";


export const userAddFollowController = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    console.log('userAddFollow Controller Connected');  

    try {
        const token = req.headers.authorization?.split(' ')[1] as string;
        const userTag: string = decodeTokenUserTag(token) as string;
        const followTag = req.body.followTag as string;

        const result = await userAddFollowService(userTag, followTag);

        return res.status(200).json(result); 

    } catch (error : any) {
        console.log(error);
        return res.status(500).json({ message: 'userAddFollow Controller error' });  
    }
};

// Follower 보기
export const showFollowerController = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    console.log('showFollower Controller Connected');

    try {
        const userTag = decodeURIComponent(req.params.userTag) as string;  // URL 디코딩 처리

        const result = await showFollowerService(userTag);

        return res.status(200).json(result);

    } catch(error : any) {
        console.log(error);
        return res.status(500).json({ message: 'Look UP Follower List Controller error' });
    }
};

// Following 보기
export const showFollowingController = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    console.log('showFollowing Controller Connected');

    try {
        const userTag = decodeURIComponent(req.params.userTag) as string;  // URL 디코딩 처리

        const result = await showFollowingService(userTag);

        return res.status(200).json(result);

    } catch(error : any) {
        console.log(error);
        return res.status(500).json({ message: 'Look UP Following List Controller error' });
    }
};

export const searchFollowerController = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any>=> {
    try {
        const myTag = decodeURIComponent(req.params.myTag) as string;
        const follower = decodeURIComponent(req.params.follower) as string;

        const result = await searchFollowerService(myTag, follower);

        return res.status(200).json(result);

    } catch (error : any ) {
        console.log(error);
        return res.status(500).json({ message : 'searchFollow Controller error' });
    }
}; 


export const searchFollowingController = async(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any>=> {
    try {
        const myTag = decodeURIComponent(req.params.myTag) as string;
        const following = decodeURIComponent(req.params.following) as string;

        const result = await searchFollowingService(myTag, following);

        return res.status(200).json(result);

    } catch (error : any ) {
        console.log(error);
        return res.status(500).json({ message : 'searchFollowing Controller error' });
    }
}; 
