import { IProduct } from "../models/product";
import { IReview } from "../models/review";

export type CreateProductDto = Omit<IProduct, "reviewList" | "averageRating" | "deleted">
export type CreateReviewDto = IReview;