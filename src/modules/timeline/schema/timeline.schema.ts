import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TimelineDocument = Timeline & Document;

@Schema({ timestamps: true })
export class Timeline {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId;
}

export const TimelineSchema = SchemaFactory.createForClass(Timeline);

TimelineSchema.index({ userId: 1, createdAt: -1 });
