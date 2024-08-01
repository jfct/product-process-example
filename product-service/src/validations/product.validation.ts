import { body } from "express-validator";


export const createProductValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isNumeric().custom((value) => value >= 0).withMessage('Price must be a positive number'),
];

export const updateProductValidation = [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('price').optional().isNumeric().custom((value) => value >= 0).withMessage('Price must be a positive number'),
];

