import { UpdateResult } from "mongodb";
import Product, { IProduct } from "../models/product";
import Review from "../models/review";
import HttpException from "../types/errors/http-exception";

/**
 * Since there is some circular dependency it's best to create a new service to deal with the requirement of
 * deleting objects that are connected
 * 
 * Mainly done because of the removal of product (needed to update all the reviews to deleted: true)
 */
class ProductReviewService {
    constructor() { }

    public async updateProductAfterReviewAdded(productId: string, reviewId: string): Promise<IProduct | null> {
        const product = Product
            .findOneAndUpdate(
                { _id: productId, deleted: false },
                { $push: { reviews: reviewId } },
                { new: true }
            )
            .exec();

        if (!product) {
            throw new HttpException(404, 'No product with that productId was found');
        }

        return product;
    }

    public async updateReviewsAfterProductRemoved(productId: string): Promise<UpdateResult> {
        return Review.updateMany({ productId }, { deleted: true });
    }

    public async updateProductAfterReviewRemoved(productId: string, reviewId: string): Promise<IProduct | null> {
        return Product.findByIdAndUpdate(
            { _id: productId },
            { $pull: { reviews: reviewId } }
        ).exec();
    }
}

export default ProductReviewService;