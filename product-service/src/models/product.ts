import { Model, model, Schema } from "mongoose";
import { IReview, ReviewSchema } from "./review";

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    reviewList: IReview[];
}

const ProductSchema: Schema = new Schema<IProduct>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    reviewList: { type: [ReviewSchema], required: true },
})

const Product: Model<IProduct> = model<IProduct>('Product', ProductSchema);

export default Product;