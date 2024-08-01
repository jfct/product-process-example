import { Job, Queue } from "bullmq";
import { QueueReviewDto } from "../dtos/queue.dto";

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

class QueueClient {
    private queue: Queue;

    constructor() {
        this.queue = new Queue('review-queue', { connection });
    }

    public async add(data: QueueReviewDto): Promise<Job<QueueReviewDto>> {
        const job = await this.queue.add('review', data);
        console.log(`Job added to the queue!`)
        return job;
    }

}


export default QueueClient;