import Redis from 'ioredis';
import { CachedProductDto } from '../dtos/redis.dto';
import { IReview } from '../schemas/review.schema';

class RedisClient {
    private connection: Redis;

    constructor() {
        this.connection = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            maxRetriesPerRequest: null
        });
    }

    /**
     * On cache startup we probably want to feed it some of the most popular product reviews
     * 
     * Since this is in the shared folder, we receive some products to add to the cache instead of
     * doing it all here
     */
    public async setUpCache(productList: CachedProductDto[]): Promise<void> {
        try {
            for (const product of productList) {
                await this.setProduct(product.id, product);
            }
            console.log('Cache set up successfully!');
        } catch (error) {
            console.error('Error during cache set up:', error);
        }
    }

    public async updateProductReviewList(productId: string, reviews: IReview[]): Promise<CachedProductDto | null> {
        const cachedProduct = await this.connection.get(productId);
        if (!cachedProduct) {
            return null
        }

        const product: CachedProductDto = JSON.parse(cachedProduct);
        product.reviews = reviews;

        await this.setProduct(productId, product);
        return product;
    }

    public getConnection() {
        return this.connection;
    }

    public async exists(productId: string) {
        return this.connection.exists(productId);
    }

    public async getProduct(productId: string): Promise<CachedProductDto> {
        const cachedProduct = await this.connection.get(productId);
        return cachedProduct ? JSON.parse(cachedProduct) : null;
    }

    public async setProduct(productId: string, product: CachedProductDto): Promise<Boolean> {
        // Set a limit of 3 days of storage
        // 259200 is the number of seconds
        const cachedProduct = await this.connection.set(productId, JSON.stringify(product), 'EX', process.env.CACHE_PERIOD || 259200);
        return cachedProduct === 'OK' ? true : false;
    }

    public async addReview(productId: string, review: IReview): Promise<CachedProductDto> {
        const product = await this.getProduct(productId);
        product.reviews.push(review);

        await this.setProduct(productId, product);
        return product
    }

    public async removeReview(productId: string, reviewId: string): Promise<Boolean> {
        const product = await this.getProduct(productId);
        product.reviews = product.reviews.filter((value) => {
            return value._id.toString() !== reviewId
        });

        await this.setProduct(productId, product);
        return true
    }

    public async editReview(productId: string, reviewId: string, review: IReview): Promise<CachedProductDto> {
        const product = await this.getProduct(productId);
        product.reviews = product.reviews.map((oldReview) =>
            oldReview._id.toString() === reviewId ? review : oldReview
        );

        await this.setProduct(productId, product);
        return product
    }

    public async getProductAverageRating(productId: string): Promise<number> {
        const product = await this.getProduct(productId);
        return product?.averageRating ?? 0;
    }

    public async updateProductAverageRating(productId: string, newAverageRating: number) {
        const product = await this.getProduct(productId);
        product.averageRating = newAverageRating;

        await this.setProduct(productId, product);
        return product;
    }
}

export default RedisClient;