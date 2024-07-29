import { body, param, query } from "express-validator";

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
    query('page').default(0).notEmpty().isNumeric().isLength({ min: 0 }),
    query('limit').default(0).notEmpty().isNumeric().isLength({ min: 0 })
];

export const idValidation = [
    param('id').notEmpty()
]