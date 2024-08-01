import { IReview } from "../schemas/review.schema";

export enum ReviewAction {
    ADD = 'ADD',
    DELETE = 'DELETE',
    MODIFIED = 'MODIFIED'
}

export interface QueueReviewDto {
    action: ReviewAction;
    review: IReview;
}

