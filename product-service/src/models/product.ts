import { model, Model, Schema } from "mongoose";
import { IReview, ReviewSchema } from "./review";

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    deleted: boolean;
    reviewList: IReview[];
    averageRating: number;
}

const ProductSchema: Schema = new Schema<IProduct>({
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
    reviewList: {
        type: [ReviewSchema],
        required: false,
        nullable: true
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

ProductSchema.index({ name: 1 }, { unique: true });

ProductSchema.virtual('averageRating').get(function (this: IProduct) {
    if (this.reviewList.length === 0) {
        return 0;
    }

    // This assumes that the reviews have been populated
    const sum = this.reviewList.reduce((acc: number, review: IReview) => acc + review.rating, 0);
    return sum / this.reviewList.length;
});

const Product: Model<IProduct> = model<IProduct>('Product', ProductSchema);

export default Product;