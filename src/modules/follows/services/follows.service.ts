import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Follow, FollowDocument } from '../schema/follow.schema';
import { UsersService } from '../../users/services/users.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';

@Injectable()
export class FollowsService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    private usersService: UsersService,
    private webSocketGatewayService: WebSocketGatewayService,
  ) {}

  async followUser(
    followerId: string,
    followingUsername: string,
  ): Promise<{ message: string }> {
    const userToFollow =
      await this.usersService.findByUsername(followingUsername);

    if (!userToFollow) {
      throw new NotFoundException('User not found');
    }

    const followingId = String(userToFollow._id);

    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const existingFollow = await this.followModel.findOne({
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
    });

    if (existingFollow) {
      return { message: 'Already following this user' };
    }

    await this.followModel.create({
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
    });

    await Promise.all([
      this.usersService.incrementFollowingCount(followerId),
      this.usersService.incrementFollowersCount(followingId),
    ]);

    const follower = await this.usersService.findById(followerId);
    if (follower) {
      this.webSocketGatewayService.notifyFollow(followingId, {
        username: follower.username,
        displayName: follower.displayName,
        profileImage: follower.profileImage,
      });
    }

    return { message: 'Successfully followed user' };
  }

  async unfollowUser(
    followerId: string,
    followingUsername: string,
  ): Promise<{ message: string }> {
    const userToUnfollow =
      await this.usersService.findByUsername(followingUsername);

    if (!userToUnfollow) {
      throw new NotFoundException('User not found');
    }

    const followingId = String(userToUnfollow._id);

    const result = await this.followModel.deleteOne({
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
    });

    if (result.deletedCount === 0) {
      return { message: 'You are not following this user' };
    }

    await Promise.all([
      this.usersService.decrementFollowingCount(followerId),
      this.usersService.decrementFollowersCount(followingId),
    ]);

    return { message: 'Successfully unfollowed user' };
  }

  async getFollowers(username: string, page = 1, limit = 20): Promise<any[]> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skip = (page - 1) * limit;

    const followers = await this.followModel
      .find({ followingId: new Types.ObjectId(String(user._id)) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(
        'followerId',
        'username displayName profileImage bio followersCount',
      )
      .exec();

    return followers.map((f) => f.followerId);
  }

  async getFollowing(username: string, page = 1, limit = 20): Promise<any[]> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skip = (page - 1) * limit;

    const following = await this.followModel
      .find({ followerId: new Types.ObjectId(String(user._id)) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(
        'followingId',
        'username displayName profileImage bio followersCount',
      )
      .exec();

    return following.map((f) => f.followingId);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followModel.exists({
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
    });
    return !!follow;
  }

  async getFollowersIds(userId: string): Promise<string[]> {
    const followers = await this.followModel
      .find({ followingId: new Types.ObjectId(userId) })
      .select('followerId')
      .lean()
      .exec();

    return followers.map((f) => String(f.followerId));
  }
}
