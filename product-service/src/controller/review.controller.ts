import { Request, Response } from "express";

class ReviewController {
    constructor() {
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