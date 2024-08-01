import { Document, Schema } from "mongoose";
import { ReviewDto } from "../dtos/model.dto";

export interface IReview extends Document, ReviewDto {
    _id: string;
    deleted: boolean;
}

export const ReviewSchema: Schema = new Schema<IReview>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    review: { type: String, required: true },
    rating: { type: Number, required: true },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    deleted: {
        type: Boolean,
        required: true,
        default: false
    },
})