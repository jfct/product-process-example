import mongoose from "mongoose";
import { CreateReviewDto } from "../dto/model.dto";
import Review, { IReview } from "../models/review";
import HttpException from "../types/errors/http-exception";
import ProductReviewService from "./product-review.service";
import Service from "./service";

class ReviewService extends Service<IReview, CreateReviewDto, typeof Review> {
    constructor(private productReviewService: ProductReviewService) {
        super(Review);
    }

    public async createReviewAndUpdateProduct(payload: CreateReviewDto): Promise<IReview> {
        const session = await mongoose.startSession();
        session.startTransaction();

        const productId = payload.productId as string;

        try {
            // Create the review
            // Update the product
            // Return review
            const review = await this.create(payload);

            // Update the product
            await this.productReviewService.updateProductAfterReviewAdded(productId, review.id);

            session.commitTransaction();
            return review;
        } catch (error) {
            session.abortTransaction();
            throw error
        } finally {
            session.endSession();
        }
    }

    /**
     * We have to override deletion because we must update the product once the review is removed
     */
    public async delete(id: string): Promise<IReview> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Update to deleted status
            const review = await Review.findOneAndUpdate({ _id: id }, { deleted: true }, { new: true });

            if (!review) {
                throw new HttpException(404, 'No review with that Id exists');
            }

            // Validate if product exists
            const productId = review.productId instanceof mongoose.Types.ObjectId
                ? review.productId.toString()
                : review.productId as string;

            // Will update the product to remove the review
            await this.productReviewService.updateProductAfterReviewRemoved(productId, id);

            session.commitTransaction();
            return review;
        } catch (error) {
            session.abortTransaction();
            throw error
        } finally {
            session.endSession();
        }
    }
}

export default ReviewService;