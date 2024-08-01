import { model, Model } from "mongoose";
import { IProduct, ProductSchema } from "shared";

const Product: Model<IProduct> = model<IProduct>('Product', ProductSchema);
export default Product;