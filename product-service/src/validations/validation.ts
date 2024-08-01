import { param, query } from "express-validator";
import { ObjectId } from "mongodb";

export const validateObjectId = (id: string) => ObjectId.isValid(id) && (ObjectId.createFromHexString(id)).toString() === id; //true or false

export const listValidation = [
    query('page').default(1).notEmpty().isInt({ min: 1 }).withMessage(`Invalid value (minimum value is 1)`),
    query('limit').default(0).notEmpty().isInt({ min: 0, max: 10 }).withMessage(`Invalid value (between 0-10)`)
];

export const idValidation = [
    param('id').notEmpty().custom((value) => validateObjectId(value))
]