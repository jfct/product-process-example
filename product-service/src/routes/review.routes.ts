import { Router } from 'express';
import ReviewController from '../controller/review.controller';
import { createReviewValidation, updateReviewValidation } from '../validations/review.validation';
import { idValidation } from '../validations/validation';

const reviewRouter = Router();
const reviewController = new ReviewController();

reviewRouter.get('/:id', idValidation, reviewController.get.bind(reviewController));
reviewRouter.post('/', createReviewValidation, reviewController.create.bind(reviewController));
reviewRouter.put('/:id', [...idValidation, ...updateReviewValidation], reviewController.update.bind(reviewController));
reviewRouter.delete('/:id', idValidation, reviewController.delete.bind(reviewController));

//reviewRouter.get('/:id', reviewController..bind(reviewController));

export default reviewRouter;