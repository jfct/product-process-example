import { Request, Response } from "express";
import ReviewService from "../services/review.service";

class ReviewController {
    private reviewService: ReviewService

    constructor() {
        this.reviewService = new ReviewService();
    }

    public async createReview(req: Request, res: Response) {
        try {
            res.status(201).json('true');
        } catch (error) {
            res.status(400).json({ error: 'false' });
        }
    }
    public async deleteReview(req: Request, res: Response) {
        try {
            res.status(201).json('true');
        } catch (error) {
            res.status(400).json({ error: 'false' });
        }
    }
    public async updateReview(req: Request, res: Response) {
        try {
            res.status(201).json('true');
        } catch (error) {
            res.status(400).json({ error: 'false' });
        }
    }
    public async listReviews(req: Request, res: Response) {
        try {
            res.status(201).json('true');
        } catch (error) {
            res.status(400).json({ error: 'false' });
        }
    }
}

export default ReviewController