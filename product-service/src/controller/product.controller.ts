import { Request, Response } from "express";
import ProductService from "../services/product.service";

class ProductController {
    private productService: ProductService;

    constructor() {
        this.productService = new ProductService()
    }

    public async createProduct(req: Request, res: Response) {
        try {
            res.status(201).json('true');
        } catch (error) {
            res.status(400).json({ error: 'false' });
        }
    }
    public async deleteProduct(req: Request, res: Response) {
        try {
            res.status(201).json('true');
        } catch (error) {
            res.status(400).json({ error: 'false' });
        }
    }
    public async updateProduct(req: Request, res: Response) {
        try {
            res.status(201).json('true');
        } catch (error) {
            res.status(400).json({ error: 'false' });
        }
    }
    public async listProducts(req: Request, res: Response) {
        try {
            res.status(201).json('true');
        } catch (error) {
            res.status(400).json({ error: 'false' });
        }
    }
    public async getProductById(req: Request, res: Response) {
        try {
            res.status(201).json('true');
        } catch (error) {
            res.status(400).json({ error: 'false' });
        }
    }

}

export default ProductController