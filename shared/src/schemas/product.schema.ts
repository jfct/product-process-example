import { Document, ObjectId, Schema } from "mongoose";
import { ProductDto } from "../dtos/model.dto";
import { IReview } from "./review.schema";

export interface IProduct extends Document, ProductDto {
    _id: string;
    deleted: boolean;
    reviews: ObjectId[];
};

export interface IProductPopulated extends Document, ProductDto {
    deleted: boolean;
    reviews: IReview[];
    averageRating: number;
};

export interface IProductRating extends Omit<IProduct, 'reviews'> {
    averageRating: number;
}

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
    reviews: {
        type: [Schema.Types.ObjectId],
        ref: 'Review',
        required: false,
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

ProductSchema.index({ name: 1 }, { unique: true });

ProductSchema.virtual('averageRating').get(function (this: IProductPopulated) {
    if (!this.reviews || this.reviews.length === 0) {
        return 0;
    }

    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / this.reviews.length;
});

