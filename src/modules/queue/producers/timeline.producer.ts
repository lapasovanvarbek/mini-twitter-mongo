import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface TimelineJobData {
  postId: string;
  authorId: string;
}

@Injectable()
export class TimelineProducer {
  constructor(
    @InjectQueue('timeline') private timelineQueue: Queue<TimelineJobData>,
  ) {}

  async addTimelineJob(data: TimelineJobData): Promise<void> {
    await this.timelineQueue.add('fan-out-post', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 3600,
        count: 1000,
      },
      removeOnFail: {
        age: 86400,
      },
    });
  }
}
