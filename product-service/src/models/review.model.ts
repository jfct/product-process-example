import { model, Model } from "mongoose";
import { IReview, ReviewSchema } from "shared";

const Review: Model<IReview> = model<IReview>('Review', ReviewSchema);
export default Review;