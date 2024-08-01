import { IReview } from "../schemas/review.schema";

export interface CachedProductDto {
    id: string,
    averageRating: number,
    reviews: IReview[]
}