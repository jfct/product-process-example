import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { CreateReviewDto, ReviewAction } from 'shared';
import QueueClient from 'shared/dist/clients/queue-client';
import Review from '../models/review.model';
import ReviewService from '../services/review.service';


describe('ReviewService', () => {
    let reviewService: ReviewService;
    let mockQueueClient: jest.Mocked<QueueClient>;
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(() => {
        mockQueueClient = {
            add: jest.fn(),
        } as unknown as jest.Mocked<QueueClient>;
        reviewService = new ReviewService(mockQueueClient);
    });

    afterEach(async () => {
        await Review.deleteMany({});
        jest.clearAllMocks();
    });

    describe('createReviewAndUpdateProduct', () => {
        it('should create a review and add it to the queue', async () => {
            const payload: CreateReviewDto = {
                firstName: 'John',
                lastName: 'Doe',
                review: 'Great product!',
                rating: 5,
                productId: new mongoose.Types.ObjectId().toString(),
            };

            const createdReview = await reviewService.createReviewAndUpdateProduct(payload);
            expect(createdReview).toBeDefined();
            expect(createdReview.firstName).toBe(payload.firstName);
            expect(createdReview.lastName).toBe(payload.lastName);
            expect(createdReview.review).toBe(payload.review);
            expect(createdReview.rating).toBe(payload.rating);
            expect(createdReview.productId.toString()).toBe(payload.productId);

            expect(mockQueueClient.add).toHaveBeenCalledWith({
                review: expect.objectContaining({ ...createdReview }),
                action: ReviewAction.ADD,
            });
        });
    });

    describe('update', () => {
        it('should update a review and add it to the queue', async () => {
            const review = await Review.create({
                firstName: 'John',
                lastName: 'Doe',
                review: 'Great product!',
                rating: 5,
                productId: new mongoose.Types.ObjectId(),
            });

            const updatePayload = {
                firstName: 'Jane',
                rating: 4,
            };

            const updatedReview = await reviewService.update(review._id.toString(), updatePayload);

            expect(updatedReview).toBeDefined();
            expect(updatedReview?.firstName).toBe(updatePayload.firstName);
            expect(updatedReview?.rating).toBe(updatePayload.rating);

            expect(mockQueueClient.add).toHaveBeenCalledWith({
                review: expect.objectContaining(updatedReview),
                action: ReviewAction.MODIFIED,
            });
        });

        it('should return null if review is not found', async () => {
            const nonExistentId = new mongoose.Types.ObjectId().toString();
            const updatePayload = { firstName: 'Jane' };

            const result = await reviewService.update(nonExistentId, updatePayload);

            expect(result).toBeNull();
            expect(mockQueueClient.add).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should mark a review as deleted and add it to the queue', async () => {
            const review = await Review.create({
                firstName: 'John',
                lastName: 'Doe',
                review: 'Great product!',
                rating: 5,
                productId: new mongoose.Types.ObjectId(),
            });

            const deletedReview = await reviewService.delete(review._id.toString());

            expect(deletedReview).toBeDefined();
            expect(deletedReview.deleted).toBe(true);

            expect(mockQueueClient.add).toHaveBeenCalledWith({
                review: expect.objectContaining(deletedReview),
                action: ReviewAction.DELETE,
            });
        });

        it('should throw an error if review is not found', async () => {
            const nonExistentId = new mongoose.Types.ObjectId().toString();

            await expect(reviewService.delete(nonExistentId)).rejects.toThrow('No review with that Id exists');
        });
    });
});