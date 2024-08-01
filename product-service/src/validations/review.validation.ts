import { body } from "express-validator";
import { validateObjectId } from "./validation";

export const createReviewValidation = [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('review').notEmpty().withMessage('Review is required'),
    body('rating').isInt({ max: 5, min: 0 }).withMessage('Rating must be integer within (0-5)'),
    body('productId').notEmpty().withMessage('You must enter a productId'),
    body('productId').custom((value) => validateObjectId(value)).withMessage('productId is not an ObjectId')

];

export const updateReviewValidation = [
    body('firstName').optional().notEmpty().withMessage('First name is required'),
    body('lastName').optional().notEmpty().withMessage('Last name is required'),
    body('review').optional().notEmpty().withMessage('Review is required'),
    body('rating').optional().isInt({ max: 5, min: 0 }).withMessage('Rating must be within (0-5) and with a single decimal digit'),
];
