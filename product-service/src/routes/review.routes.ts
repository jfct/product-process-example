import { Router } from 'express';
import ReviewController from '../controller/review.controller';

const reviewRouter = Router();
const reviewController = new ReviewController();

reviewRouter.get('/', reviewController.createReview.bind(reviewController));
reviewRouter.post('/', reviewController.deleteReview.bind(reviewController));
reviewRouter.get('/:id', reviewController.listReviews.bind(reviewController));
reviewRouter.put('/:id', reviewController.updateReview.bind(reviewController));

export default reviewRouter;