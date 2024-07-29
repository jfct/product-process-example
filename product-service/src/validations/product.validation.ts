import { body, param, query } from "express-validator";
import { ObjectId } from "mongodb";

export const createProductValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
];

export const updateProductValidation = [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
];

export const listValidation = [
    query('page').default(1).notEmpty().isInt({ min: 1 }).withMessage(`Invalid value (minimum value is 1)`),
    query('limit').default(0).notEmpty().isInt({ min: 0, max: 10 }).withMessage(`Invalid value (between 0-10)`)
];

export const idValidation = [
    param('id').notEmpty().custom((value) => ObjectId.isValid(value))
]