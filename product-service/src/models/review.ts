import { Document, Model, model, Schema } from "mongoose";

export interface IReview extends Document {
    firstName: string;
    lastName: string;
    review: string;
    rating: number;
}

export const ReviewSchema: Schema = new Schema<IReview>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    review: { type: String, required: true },
    rating: { type: Number, required: true }
})

const Review: Model<IReview> = model<IReview>('Product', ReviewSchema);

export default Review;