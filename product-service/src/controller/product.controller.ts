import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import { CreateProductDto } from "shared";
import RedisClient from "shared/dist/clients/redis-client";
import ProductService from "../services/product.service";
import { IdParams, QueryParams, RequestWithParams, RequestWithQuery } from "../types/types";
import BaseController from "./controller";


class ProductController extends BaseController<CreateProductDto> {
    protected service: ProductService;

    constructor() {
        super();
        this.service = new ProductService(new RedisClient());
    }

    public async get(req: RequestWithParams<IdParams>, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const data = await this.service.getProductWithRating(req.params.id);
            if (!data) {
                return res.status(404).json({ status: 'error', message: 'Id not found' });
            }

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }

    public async listReviewsForProduct(req: RequestWithParams<IdParams>, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 'error', error: errors.array() });
        }

        try {
            const productReviews = await this.service.getReviewsForProduct(req.params.id);
            if (!productReviews) {
                res.status(404).json({ status: 'error', error: 'No reviews found for this product' })
                return
            }
            res.status(201).json(productReviews);
        } catch (error) {
            next(error);
        }
    }

    public async listProducts(req: RequestWithQuery<QueryParams>, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 'error', error: errors.array() });
        }

        try {
            const products = await this.service.getList(req.query.page, req.query.limit);
            res.status(201).json({
                page: req.query.page,
                limit: req.query.limit,
                products: products
            });
        } catch (error) {
            next(error);
        }
    }
}

export default ProductController;