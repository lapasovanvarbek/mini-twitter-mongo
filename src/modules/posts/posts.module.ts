import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schema/post.schema';
import { Like, LikeSchema } from './schema/like.schema';
import { PostsService } from './services/posts.service';
import { PostsController } from './posts.controller';
import { UsersModule } from '../users/users.module';
import { TimelineModule } from '../timeline/timeline.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Like.name, schema: LikeSchema },
    ]),
    UsersModule,
    forwardRef(() => TimelineModule),
    QueueModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
