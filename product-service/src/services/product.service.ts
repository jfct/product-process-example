import { CreateProductDto, HttpException, IProduct, IProductPopulated, IProductRating } from "shared";
import RedisClient from "shared/dist/clients/redis-client";
import Product from "../models/product.model";
import BaseService from "./base.service";


class ProductService extends BaseService<IProduct, CreateProductDto, typeof Product> {
    constructor(private cacheClient: RedisClient) {
        super(Product);
    }

    public async getProductWithRating(id: string): Promise<IProductRating | null> {
        try {
            const product = await Product.findOne<IProduct>({ _id: id, deleted: false }).lean();
            if (!product) {
                throw new HttpException(404, 'No product with this Id found');
            }
            const averageRating = await this.getAverageRating(id);

            return {
                ...product,
                averageRating
            }
        } catch (error) {
            throw new Error(`Error getting product: ${error}`);
        }
    }

    public async delete(id: string): Promise<IProduct | null> {
        const newProduct = Product
            .findOneAndUpdate({ _id: id, deleted: false }, { deleted: true }, { new: true })
            .exec();
        return newProduct;
    }

    public async getList(page: number, limit: number) {
        // Skip X elements per page
        const skip = (page - 1) * limit;
        return Product.find({ deleted: false }).select('-reviews').skip(skip).limit(limit).lean();
    }

    public async getReviewsForProduct(id: string): Promise<IProduct | null> {
        try {
            // Hides the review info
            return Product.findOne({ _id: id, deleted: false }).populate('reviews').select('reviews averageRating').lean();
        } catch (error) {
            throw new Error(`Error getting product: ${error}`);
        }
    }

    /**
     * Tries to get from cache, if it does not exist, retrieve from DB and then put it in cache
     */
    private async getAverageRating(id: string): Promise<number> {
        try {
            const cachedRating = await this.cacheClient.getProductAverageRating(id);

            // If no rating cached
            if (!cachedRating) {
                const product = await Product.findOne<IProductPopulated>(({ id, deleted: false })).populate('reviews').exec();
                if (!product) {
                    throw new HttpException(404, 'No product with this Id found');
                }

                // Cache the rating
                await this.cacheClient.setProduct(id, {
                    id: product.id,
                    reviews: product.reviews,
                    averageRating: product.averageRating || 0
                });

                return product.averageRating || 0;
            }

            return cachedRating;
        } catch (error) {
            throw new Error(`Error getting average rating: ${error}`);
        }
    }
}

export default ProductService;