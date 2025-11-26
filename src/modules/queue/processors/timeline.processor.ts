import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { TimelineService } from '../../timeline/services/timeline.service';
import { TimelineJobData } from '../producers/timeline.producer';

@Processor('timeline')
@Injectable()
export class TimelineProcessor extends WorkerHost {
  constructor(private timelineService: TimelineService) {
    super();
  }

  async process(job: Job<TimelineJobData>): Promise<void> {
    const { postId, authorId } = job.data;

    console.log(
      `Processing timeline job for post ${postId} by user ${authorId}`,
    );

    try {
      await this.timelineService.fanOutPostToFollowers(postId, authorId);
      console.log(`Successfully fanned out post ${postId}`);
    } catch (error) {
      console.error(`Error processing timeline job for post ${postId}:`, error);
      throw error;
    }
  }
}
