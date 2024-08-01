import { CreateReviewDto, HttpException, IReview, QueueReviewDto, ReviewAction } from "shared";
import QueueClient from "shared/dist/clients/queue-client";
import Review from "../models/review.model";
import BaseService from "./base.service";

class ReviewService extends BaseService<IReview, CreateReviewDto, typeof Review> {
    private queue: QueueClient = new QueueClient();

    constructor() {
        super(Review);
    }

    public async createReviewAndUpdateProduct(payload: CreateReviewDto): Promise<IReview> {

        const productId = payload.productId as string;

        // Create the review
        // Update the product
        // Return review
        const review = await this.create(payload);
        if (!review) {
            throw new Error('Error creating the review')
        }

        const queueReview: QueueReviewDto = {
            review,
            action: ReviewAction.ADD,
        }

        // Add to the queue
        await this.queue.add(queueReview)

        return review;

    }

    public async update(id: string, payload: Partial<CreateReviewDto>): Promise<IReview | null> {
        const review = await Review
            .findOneAndUpdate({ _id: id, deleted: false }, payload, { new: true })
            .lean();

        if (review) {
            const queueReview: QueueReviewDto = {
                action: ReviewAction.MODIFIED,
                review,
            }
            // Add to the queue
            await this.queue.add(queueReview)
        }

        return review;
    }

    /**
     * We have to override deletion because we must update the product once the review is removed
     */
    public async delete(id: string): Promise<IReview> {
        // Update to deleted status
        const review = await Review.findOneAndUpdate({ _id: id }, { deleted: true }, { new: true });

        if (!review) {
            throw new HttpException(404, 'No review with that Id exists');
        }

        const queueReview: QueueReviewDto = {
            action: ReviewAction.DELETE,
            review,
        }
        // Add to the queue
        await this.queue.add(queueReview)



        return review;
    }
}

export default ReviewService;