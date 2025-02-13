
import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import { CreateReviewDto } from "shared";
import QueueClient from "shared/dist/clients/queue-client";
import ReviewService from "../services/review.service";
import { RequestWithBody } from "../types/types";
import BaseController from "./controller";

class ReviewController extends BaseController<CreateReviewDto> {
    protected service: ReviewService;

    constructor() {
        super();
        this.service = new ReviewService(new QueueClient());
    }

    public async create(req: RequestWithBody<CreateReviewDto>, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ status: 'error', error: errors.array() });
            return;
        }

        try {
            const review = await this.service.createReviewAndUpdateProduct(req.body);
            res.status(201).json(review);
        } catch (error) {
            next(error);
        }
    }
}

export default ReviewController;