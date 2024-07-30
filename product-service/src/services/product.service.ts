import mongoose from "mongoose";
import { CreateProductDto } from "../dto/model.dto";
import Product, { IProduct } from "../models/product";
import ProductReviewService from "./product-review.service";
import Service from "./service";


class ProductService extends Service<IProduct, CreateProductDto, typeof Product> {
    constructor(private productReviewService: ProductReviewService) {
        super(Product);
    }

    public async get(id: string): Promise<IProduct | null> {
        try {
            // Hides the review info
            return Product.findOne({ _id: id, deleted: false }).select('-reviews').exec();
        } catch (error) {
            throw new Error(`Error getting product: ${error}`);
        }
    }

    public async delete(id: string): Promise<IProduct | null> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const newProduct = Product
                .findOneAndUpdate({ _id: id, deleted: false }, { deleted: true }, { new: true })
                .exec();

            // Will update the reviews after removeing the product
            await this.productReviewService.updateReviewsAfterProductRemoved(id);

            session.commitTransaction();
            return newProduct;
        } catch (error) {
            session.abortTransaction();
            throw error
        } finally {
            session.endSession();
        }
    }

    public async getList(page: number, limit: number) {
        // Skip X elements per page
        const skip = (page - 1) * limit;
        return Product.find({ deleted: false }).select('-reviews').skip(skip).limit(limit).exec();
    }

    public async getReviewsForProduct(id: string): Promise<IProduct | null> {
        try {
            // Hides the review info
            return Product.findOne({ _id: id, deleted: false }).populate('reviews').select('reviews').exec();
        } catch (error) {
            throw new Error(`Error getting product: ${error}`);
        }
    }

    // public async addReview(productId: string, reviewId: string) {
    //     try {
    //         // Push the review to the product
    //         return Product
    //             .findOneAndUpdate(
    //                 { _id: productId, deleted: false },
    //                 { $push: { reviews: reviewId } },
    //                 { new: true }
    //             )
    //             .exec();
    //     } catch (error) {
    //         throw new Error(`Error adding review to product: ${error}`);
    //     }
    // }

    // public async removeReview(productId: string, reviewId: string) {
    //     try {
    //         return Product.findByIdAndUpdate(
    //             { _id: productId },
    //             { $pull: { reviews: reviewId } }
    //         ).exec();
    //     } catch (error) {
    //         throw new Error(`Error removing review from product: ${error}`);
    //     }
    // }
}

export default ProductService;