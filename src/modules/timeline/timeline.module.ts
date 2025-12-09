import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Timeline, TimelineSchema } from './schema/timeline.schema';
import { Post, PostSchema } from '../posts/schema/post.schema';
import { TimelineService } from './services/timeline.service';
import { FollowsModule } from '../follows/follows.module';
import { UsersModule } from '../users/users.module';
import { TimelineController } from './timeline.controller';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Timeline.name, schema: TimelineSchema },
      { name: Post.name, schema: PostSchema },
    ]),
    FollowsModule,
    UsersModule,
    WebSocketModule,
  ],
  controllers: [TimelineController],
  providers: [TimelineService],
  exports: [TimelineService],
})
export class TimelineModule {}
