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

    // Cleans the queue for jobs older than 1 minute
    public async clear() {
        await this.queue.clean(60000, 1000, 'completed'); // 60000ms = 1 minute, 1000 = max jobs to clean at a time
    }

}


export default QueueClient;