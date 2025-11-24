import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  username: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  displayName: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: '' })
  profileImage: string;

  @Prop({ default: 0 })
  followersCount: number;

  @Prop({ default: 0 })
  followingCount: number;

  @Prop({ default: 0 })
  postsCount: number;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: '' })
  location: string;

  @Prop({ default: '' })
  website: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ isDeleted: 1 });
UserSchema.index({ deletedAt: 1 });
