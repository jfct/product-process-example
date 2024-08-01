import { IProduct, IProductPopulated } from "shared";
import Product from "../models/product.model";

class ReviewProcessingService {
    constructor() {
    }

    public async updateProductAverageRating(productId: string, newAverageRating: number): Promise<IProduct | null> {
        return Product.findByIdAndUpdate<IProduct>({ _id: productId, deleted: false }, { averageRating: newAverageRating });
    }

    public async calculateProductAverageRating(productId: string) {
        // Get average rating for the product
        const product = await Product.findOne<IProductPopulated>({ _id: productId, deleted: false }).populate('reviews');

        if (!product) {
            throw new Error(`No product with Id: ${productId}`)
        }

        if (product.reviews.length <= 0) {
            return 0;
        }

        // Calculate the average rating
        const totalRating = product.reviews.reduce((acc, review) => acc + review.rating, 0)
        const newAverageRating = Math.floor((totalRating / product.reviews.length) * 10) / 10;
        return newAverageRating;
    }
}

export default ReviewProcessingService