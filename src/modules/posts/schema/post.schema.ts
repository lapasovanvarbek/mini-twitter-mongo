import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  authorId: Types.ObjectId;

  @Prop({ required: true, maxlength: 280 })
  content: string;

  // Media (we'll store URLs for now, file uploads in Phase 5)
  @Prop({
    type: [{ url: String, width: Number, height: Number, thumbnail: String }],
    default: [],
  })
  images: Array<{
    url: string;
    width?: number;
    height?: number;
    thumbnail?: string;
  }>;

  // Mentions & Hashtags
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  mentions: Types.ObjectId[];

  @Prop({ type: [String], default: [], index: true })
  hashtags: string[];

  // Engagement counters (denormalized for performance)
  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  repostsCount: number;

  @Prop({ default: 0 })
  repliesCount: number;

  @Prop({ default: 0 })
  viewsCount: number;

  // Reply info
  @Prop({ default: false })
  isReply: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Post', default: null })
  replyToPostId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  replyToUserId: Types.ObjectId | null;

  // Repost info (we'll implement this later)
  @Prop({ default: false })
  isRepost: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Post', default: null })
  originalPostId: Types.ObjectId | null;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Indexes for performance
PostSchema.index({ authorId: 1, createdAt: -1 }); // User's posts, newest first
PostSchema.index({ createdAt: -1 }); // All posts, newest first
PostSchema.index({ hashtags: 1 }); // Hashtag search
PostSchema.index({ mentions: 1 }); // Mention search
