import { CachedProductDto, CreateProductDto, HttpException, IProduct, IProductPopulated } from "shared";
import RedisClient from "shared/dist/clients/redis-client";
import Product from "../models/product.model";
import BaseService from "./base.service";


class ProductService extends BaseService<IProduct, CreateProductDto, typeof Product> {
    constructor(private cacheClient: RedisClient) {
        super(Product);
    }

    // Cache a product on creation, for convenience at this time
    public async create(value: CreateProductDto): Promise<IProduct> {
        const product = new Product(value);
        const newProduct = await product.save();
        await this.cacheProduct(newProduct.id);
        return newProduct;
    }


    public async getProductWithRating(id: string): Promise<IProduct | null> {
        const product = await Product.findOne<IProduct>({ _id: id, deleted: false }).lean();
        if (!product) {
            throw new HttpException(404, 'No product with this Id found');
        }
        const averageRating = await this.getAverageRating(id);

        return {
            ...product,
            averageRating
        }
    }

    public async delete(id: string): Promise<IProduct | null> {
        return Product
            .findOneAndUpdate({ _id: id, deleted: false }, { deleted: true }, { new: true })
            .exec();
    }

    public async getList(page: number, limit: number) {
        // Skip X elements per page
        const skip = (page - 1) * limit;
        return Product.find({ deleted: false }).select('-reviews').skip(skip).limit(limit).lean();
    }

    public async getReviewsForProduct(id: string): Promise<Pick<IProductPopulated, '_id' | 'averageRating' | 'reviews'> | null> {
        // Get cached product
        const cachedProduct = await this.cacheClient.getProduct(id);

        // If reviews are empty, cache them
        if (cachedProduct && cachedProduct.reviews.length <= 0) {
            const product = await Product.findOne<IProductPopulated>({ _id: id, deleted: false })
                .populate({
                    path: 'reviews',
                    match: { deleted: false }
                }).exec();
            const reviews = product?.reviews ?? [];
            await this.cacheClient.updateProductReviewList(id, reviews);
            return product;
        }
        return cachedProduct;
    }

    /**
     * Tries to get from cache, if it does not exist, retrieve from DB and then put it in cache
     */
    private async getAverageRating(id: string): Promise<number> {
        const cachedRating = await this.cacheClient.getProductAverageRating(id);

        // If no rating cached
        if (!cachedRating) {
            const cachedProduct = await this.cacheProduct(id);
            return cachedProduct.averageRating || 0;
        }

        return cachedRating;
    }

    /**
     * Caches a specific product
     */
    private async cacheProduct(id: string): Promise<CachedProductDto> {
        const product = await Product.findOne<IProductPopulated>(({ _id: id, deleted: false })).populate({
            path: 'reviews',
            match: { deleted: false }
        }).exec();

        if (!product) {
            throw new HttpException(404, 'No product with this Id found');
        }

        const cachedProduct = {
            id: product.id,
            reviews: product.reviews,
            averageRating: product.averageRating || 0
        }

        // Cache the rating
        const isCached = await this.cacheClient.setProduct(id, cachedProduct);

        if (!isCached) {
            throw new Error(`Error caching the product with id ${id}`)
        }

        return cachedProduct;
    }
}

export default ProductService;