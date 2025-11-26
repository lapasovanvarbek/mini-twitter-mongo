import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from '../schema/post.schema';
import { Like, LikeDocument } from '../schema/like.schema';
import { CreatePostDto } from '../dto/create-post.dto';
import { UsersService } from '../../users/services/users.service';
import { TimelineService } from '../../timeline/services/timeline.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    private usersService: UsersService,
    private timelineService: TimelineService,
  ) {}

  async create(
    userId: string,
    createPostDto: CreatePostDto,
  ): Promise<PostDocument> {
    const mentions = this.extractMentions(createPostDto.content);

    const hashtags = this.extractHashtags(createPostDto.content);

    let replyToUserId: Types.ObjectId | null = null;
    if (createPostDto.replyToPostId) {
      const originalPost = await this.postModel.findById(
        createPostDto.replyToPostId,
      );
      if (!originalPost) {
        throw new NotFoundException('Original post not found');
      }
      replyToUserId = originalPost.authorId;

      await this.postModel.findByIdAndUpdate(createPostDto.replyToPostId, {
        $inc: { repliesCount: 1 },
      });
    }

    const mentionUserIds: Types.ObjectId[] = [];
    if (mentions.length > 0) {
      const users = await this.usersService.findByUsernames(mentions);
      mentionUserIds.push(...users.map((u) => u._id as Types.ObjectId));
    }

    const post = await this.postModel.create({
      authorId: new Types.ObjectId(userId),
      content: createPostDto.content,
      mentions: mentionUserIds,
      hashtags,
      isReply: !!createPostDto.replyToPostId,
      replyToPostId: createPostDto.replyToPostId
        ? new Types.ObjectId(createPostDto.replyToPostId)
        : null,
      replyToUserId,
    });

    await this.usersService.incrementPostsCount(userId);

    this.timelineService
      .fanOutPostToFollowers(String(post._id), userId)
      .catch((error) => {
        console.error('Error fanning out post to followers:', error);
      });

    return this.populatePost(post);
  }

  async findById(postId: string, userId?: string): Promise<PostDocument> {
    const post = await this.postModel
      .findById(postId)
      .populate('authorId', 'username displayName profileImage')
      .populate('replyToPostId')
      .populate('replyToUserId', 'username displayName')
      .exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (userId) {
      const liked = await this.likeModel.exists({
        userId: new Types.ObjectId(userId),
        postId: new Types.ObjectId(postId),
      });
      (post as any).isLiked = !!liked;
    }

    return post;
  }

  async findByUser(
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

  async findAll(page = 1, limit = 20): Promise<PostDocument[]> {
    const skip = (page - 1) * limit;

    return this.postModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('authorId', 'username displayName profileImage')
      .exec();
  }

  async likePost(postId: string, userId: string): Promise<{ message: string }> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.likeModel.findOne({
      userId: new Types.ObjectId(userId),
      postId: new Types.ObjectId(postId),
    });

    if (existingLike) {
      return { message: 'Already liked' };
    }

    await this.likeModel.create({
      userId: new Types.ObjectId(userId),
      postId: new Types.ObjectId(postId),
    });

    await this.postModel.findByIdAndUpdate(postId, {
      $inc: { likesCount: 1 },
    });

    return { message: 'Post liked successfully' };
  }

  async unlikePost(
    postId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const result = await this.likeModel.deleteOne({
      userId: new Types.ObjectId(userId),
      postId: new Types.ObjectId(postId),
    });

    if (result.deletedCount === 0) {
      return { message: 'Like not found' };
    }

    await this.postModel.findByIdAndUpdate(postId, {
      $inc: { likesCount: -1 },
    });

    return { message: 'Post unliked successfully' };
  }

  async delete(postId: string, userId: string): Promise<{ message: string }> {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postModel.findByIdAndDelete(postId);

    await this.usersService.decrementPostsCount(userId);

    return { message: 'Post deleted successfully' };
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex);
    return matches ? matches.map((m) => m.substring(1)) : [];
  }

  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    return matches ? matches.map((m) => m.substring(1).toLowerCase()) : [];
  }

  private async populatePost(post: PostDocument): Promise<PostDocument> {
    const populatedPost = await this.postModel
      .findById(post._id)
      .populate('authorId', 'username displayName profileImage')
      .exec();

    if (!populatedPost) {
      throw new NotFoundException('Post not found after creation');
    }

    return populatedPost;
  }
}
