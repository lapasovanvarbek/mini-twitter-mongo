import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LikeDocument = Like & Document;

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true, index: true })
  postId: Types.ObjectId;
}

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });
LikeSchema.index({ postId: 1, createdAt: -1 });
