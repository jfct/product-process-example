import { Job, Worker } from 'bullmq';
import mongoose from 'mongoose';
import { IReview, QueueReviewDto, ReviewAction } from 'shared';
import QueueClient from 'shared/dist/clients/queue-client';
import RedisClient from 'shared/dist/clients/redis-client';
import Review from '../models/review.model';
import ReviewProcessingService from '../services/review-processing.service';

// Create a singleton worker instance
let reviewWorker: Worker | undefined;

const cacheClient = new RedisClient();
const queueClient = new QueueClient();
const reviewProcessing = new ReviewProcessingService();

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
                // Calculate and update the new average rating
                const newAverageRating = await reviewProcessing.calculateProductAverageRating(productId);
                await reviewProcessing.updateProductAverageRating(productId, newAverageRating);

                // Check if the product exists in cache
                const cachedProduct = await cacheClient.getProduct(productId);

                // If the product is not cached yet we just add it directly
                if (!cachedProduct) {
                    await cacheClient.setProduct(productId, {
                        id: productId,
                        reviews: [review],
                        averageRating: newAverageRating
                    })
                } else {
                    // If there are no reviews, try to populate from DB
                    if (cachedProduct.reviews.length <= 0) {
                        const isPopulated = await populateCachedProductReviews(productId);
                        if (!isPopulated) {
                            console.error(`Error populated review list for product ${productId}`);
                        }
                    }
                    // Process the action by the queue
                    await processQueueAction(action, productId, review, reviewId);

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

        reviewWorker.on('completed', async (job: Job) => {
            await queueClient.clear();
            console.log(`Job ${job.id} completed successfully`);
        });

        console.log('Worker started successfully!');
    } else {
        console.log('Worker already running');
    }

    return reviewWorker;
}

async function processQueueAction(action: ReviewAction, productId: string, review: IReview, reviewId: string) {
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
}

async function populateCachedProductReviews(productId: string) {
    // Check if the reviews are cached, if not, cache them
    const reviews = await Review.find<IReview>({ productId, deleted: false });
    return await cacheClient.updateProductReviewList(productId, reviews);
}

export const worker = getReviewWorker();