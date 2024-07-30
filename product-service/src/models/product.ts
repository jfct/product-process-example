import { Document, model, Model, ObjectId, Schema } from "mongoose";
import { ProductDto } from "../dto/model.dto";

export interface IProduct extends Document, ProductDto {
    deleted: boolean;
    reviews: ObjectId[];
    averageRating: number;
};

export const ProductSchema: Schema = new Schema<IProduct>({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    deleted: {
        type: Boolean,
        required: true,
        default: false
    },
    reviews: {
        type: [Schema.Types.ObjectId],
        ref: 'Review',
        required: false,
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

ProductSchema.index({ name: 1 }, { unique: true });

ProductSchema.virtual('reviewList', {
    ref: 'Review',
    localField: 'reviews',
    foreignField: '_id'
});

ProductSchema.virtual('averageRating').get(function (this: IProduct) {
    // This should be a retrieval from the review processing service?
    return 1;
});

const Product: Model<IProduct> = model<IProduct>('Product', ProductSchema);

export default Product;