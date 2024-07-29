import { CreateReviewDto } from "../models/dto";

class ReviewService {
    constructor() { }

    public async create(review: CreateReviewDto) { }
    public async get(id: string) { }
    public async update(id: string, payload: Partial<CreateReviewDto>) { }
    public async delete(id: string) { }

    public async getList() { }
}

export default ReviewService;