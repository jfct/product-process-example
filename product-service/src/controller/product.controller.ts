import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import { CreateProductDto } from "../models/dto";
import ProductService from "../services/product.service";
import { IdParams, QueryParams, RequestWithBody, RequestWithParams, RequestWithQuery } from "../types/types";

class ProductController {
    private productService: ProductService;

    constructor() {
        this.productService = new ProductService()
    }

    public async createProduct(req: RequestWithBody<CreateProductDto>, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ status: 'error', error: errors.array() });
            return;
        }

        try {
            const product = await this.productService.create(req.body);
            res.status(201).json(product);
        } catch (error) {
            next(error);
        }
    }

    public async deleteProduct(req: RequestWithParams<IdParams>, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }

        try {
            const deletedProduct = await this.productService.delete(req.params.id);
            if (!deletedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.status(201).json(deletedProduct);
        } catch (error) {
            next(error);
        }
    }

    public async updateProduct(req: RequestWithBody<Partial<CreateProductDto>>, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }

        try {
            const updatedProduct = await this.productService.update(req.params.id, req.body);
            if (!updatedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.status(201).json(updatedProduct);
        } catch (error) {
            next(error);
        }
    }

    public async listProducts(req: RequestWithQuery<QueryParams>, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }

        try {
            const products = await this.productService.getList(req.query.page, req.query.limit);
            res.status(201).json({
                page: req.query.page,
                limit: req.query.limit,
                products: products
            });
        } catch (error) {
            next(error);
        }
    }

    public async getProductById(req: RequestWithParams<IdParams>, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const product = await this.productService.get(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.status(201).json(product);
        } catch (error) {
            next(error);
        }
    }

}

export default ProductController