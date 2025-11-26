import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TimelineModule } from '../timeline/timeline.module';
import { TimelineProcessor } from './processors/timeline.processor';
import { TimelineProducer } from './producers/timeline.producer';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'timeline',
    }),
    TimelineModule,
  ],
  providers: [TimelineProcessor, TimelineProducer],
  exports: [TimelineProducer],
})
export class QueueModule {}
