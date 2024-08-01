import { CreateReviewDto, HttpException, IReview, QueueReviewDto, ReviewAction } from "shared";
import QueueClient from "shared/dist/clients/queue-client";
import Product from "../models/product.model";
import Review from "../models/review.model";
import BaseService from "./base.service";

class ReviewService extends BaseService<IReview, CreateReviewDto, typeof Review> {
    constructor(private queue: QueueClient) {
        super(Review);
    }

    public async createReviewAndUpdateProduct(payload: CreateReviewDto): Promise<IReview> {
        // Check if product exists
        const product = await Product.findOne({ _id: payload.productId, deleted: false });
        if (!product) {
            throw new HttpException(404, 'No product with that Id was found');
        }

        const review = await this.create(payload);
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
        } else {
            throw new HttpException(404, 'No review with that Id found');
        }

        return review;
    }

    /**
     * We have to override deletion because we must update the product once the review is removed
     */
    public async delete(id: string): Promise<IReview> {
        // Update to deleted status
        const review = await Review.findOneAndUpdate({ _id: id, deleted: false }, { deleted: true }, { new: true });

        if (!review) {
            throw new HttpException(404, 'No review with that Id found');
        }

        const queueReview: QueueReviewDto = {
            action: ReviewAction.DELETE,
            review,
        }
        // Add to the queue
        await this.queue.add(queueReview);
        return review;
    }
}

export default ReviewService;