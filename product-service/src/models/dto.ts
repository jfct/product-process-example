import { IProduct } from "./product";
import { IReview } from "./review";

export type CreateProductDto = Omit<IProduct, "reviewList" | "averageRating">
export type CreateReviewDto = IReview;