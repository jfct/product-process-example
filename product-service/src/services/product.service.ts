import { CreateProductDto } from "../models/dto";
import Product, { IProduct } from "../models/product";


class ProductService {
    constructor() { }

    public async create(product: CreateProductDto) {
        const newProduct = new Product(product);
        return await newProduct.save();
    }

    public async get(id: string): Promise<IProduct | null> {
        return await Product.findById(id).populate('reviewList').exec();
    }

    public async update(id: string, payload: Partial<CreateProductDto>): Promise<IProduct | null> {
        // Return the updated (new:true)
        return await Product.findByIdAndUpdate(id, payload, { new: true }).exec();
    }

    public async delete(id: string): Promise<IProduct | null> {
        return Product.findByIdAndDelete(id).exec();
    }

    public async getList(page: number, limit: number) {
        // Skip X elements per page
        const skip = (page - 1) * limit;
        return Product.find().skip(skip).limit(limit).exec();
    }
}

export default ProductService;