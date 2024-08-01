import { Job, Worker } from 'bullmq';
import mongoose, { model, Model } from 'mongoose';
import { IProduct, IProductPopulated, IReview, ProductSchema, QueueReviewDto, ReviewAction, ReviewSchema } from 'shared';
import RedisClient from 'shared/dist/clients/redis-client';



const cacheClient = new RedisClient();

const Product: Model<IProduct> = model<IProduct>('Product', ProductSchema);
const Review: Model<IReview> = model<IReview>('Review', ReviewSchema);

// Create a singleton worker instance
let reviewWorker: Worker | undefined;

function getReviewWorker(): Worker {
    if (!reviewWorker) {
        reviewWorker = new Worker('review-queue', async (job: Job<QueueReviewDto>) => {
            console.log(`Processing job ${job.id}`);

            const { action, review } = job.data;
            const reviewId: string = job.data.review._id;

            const productId = review.productId instanceof mongoose.Types.ObjectId
                ? review.productId.toString()
                : review.productId as string;

            try {
                // Get average rating for the product
                const product = await Product.findOne<IProductPopulated>({ _id: productId, deleted: false }).populate('reviews');

                if (!product) {
                    console.log(`No product with Id: ${productId}`);
                    return { success: false, productId, newAverageRating: 0 };
                }

                if (product.reviews.length <= 0) {
                    return { success: true, productId, newAverageRating: 0 };
                }

                // Calculate the average rating
                // We already have this in the virtual too
                const totalRating = product.reviews.reduce((acc, review) => acc + review.rating, 0)
                const newAverageRating = Math.floor((totalRating / product.reviews.length) * 10) / 10;

                // Check if the product exists in cache
                const cachedProduct = await cacheClient.getProduct(productId);

                // If the product is not cached yet we just add it directly
                if (!cachedProduct) {
                    await cacheClient.setProduct(productId, {
                        id: productId,
                        reviews: product.reviews,
                        averageRating: newAverageRating
                    })
                } else {
                    // Update the cache review for the product
                    switch (action) {
                        case ReviewAction.ADD:
                            await cacheClient.addReview(productId, review);
                            break;
                        case ReviewAction.MODIFIED:
                            await cacheClient.editReview(productId, reviewId, review)
                            break;
                        case ReviewAction.DELETE:
                            await cacheClient.removeReview(productId, reviewId);
                            break;
                    }

                    // Update the cache average rating
                    await cacheClient.updateProductAverageRating(productId, newAverageRating);
                    console.log(`Updated average rating for product ${productId}: ${newAverageRating}`);
                }

                return { success: true, productId, newAverageRating };
            } catch (error) {
                console.error(`Error processing job ${job.id}:`, error);
                throw error;
            }
        }, {
            connection: cacheClient.getConnection(),
            concurrency: 2, // Process multiple events concurrently
        });

        reviewWorker.on('failed', (job: Job | undefined, err: Error) => {
            if (job) {
                console.error(`Job ${job.id} failed with error: ${err.message}`);
            } else {
                console.error(`Job failed with error: ${err.message}`);
            }
        });

        reviewWorker.on('completed', (job: Job) => {
            console.log(`Job ${job.id} completed successfully`);
        });

        console.log('Worker started successfully!');
    } else {
        console.log('Worker already running');
    }

    return reviewWorker;
}

export const worker = getReviewWorker();