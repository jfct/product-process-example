import { Document, Schema } from "mongoose";
import { ProductDto } from "../dtos/model.dto";
import { IReview } from "./review.schema";

export interface IProduct extends Document, ProductDto {
    _id: string;
    averageRating: number;
    deleted: boolean;
};

export interface IProductPopulated extends Document, ProductDto {
    deleted: boolean;
    reviews: IReview[];
    averageRating: number;
};

export const ProductSchema: Schema = new Schema<IProduct>({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    deleted: {
        type: Boolean,
        required: true,
        default: false
    },
    averageRating: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 5
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

ProductSchema.index({ name: 1 }, { unique: true });

// Virtual field for reviews
ProductSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'productId'
});