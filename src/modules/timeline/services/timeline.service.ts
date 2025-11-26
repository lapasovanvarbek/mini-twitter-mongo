import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Timeline, TimelineDocument } from '../schema/timeline.schema';
import { Post, PostDocument } from '../../posts/schema/post.schema';
import { FollowsService } from '../../follows/services/follows.service';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class TimelineService {
  constructor(
    @InjectModel(Timeline.name) private timelineModel: Model<TimelineDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private followsService: FollowsService,
    private usersService: UsersService,
  ) {}

  async getHomeTimeline(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<PostDocument[]> {
    const skip = (page - 1) * limit;

    const timelineEntries = await this.timelineModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const postIds = timelineEntries.map((entry) => entry.postId);

    if (postIds.length === 0) {
      return [];
    }

    const posts = await this.postModel
      .find({ _id: { $in: postIds } })
      .populate('authorId', 'username displayName profileImage')
      .sort({ createdAt: -1 })
      .exec();

    return posts;
  }

  async getUserPosts(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<PostDocument[]> {
    const skip = (page - 1) * limit;

    return this.postModel
      .find({ authorId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('authorId', 'username displayName profileImage')
      .exec();
  }

  async fanOutPostToFollowers(postId: string, authorId: string): Promise<void> {
    const followerIds = await this.followsService.getFollowersIds(authorId);

    const timelineEntries = followerIds.map((followerId) => ({
      userId: new Types.ObjectId(followerId),
      postId: new Types.ObjectId(postId),
      createdAt: new Date(),
    }));

    timelineEntries.push({
      userId: new Types.ObjectId(authorId),
      postId: new Types.ObjectId(postId),
      createdAt: new Date(),
    });

    if (timelineEntries.length > 0) {
      await this.timelineModel.insertMany(timelineEntries);
    }
  }
}
