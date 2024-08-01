import { Schema } from "mongoose";

export interface ProductDto {
    name: string;
    description: string;
    price: number;
    averageRating: number;
};
export interface CreateProductDto extends ProductDto { };
export interface UpdateProductDto extends Partial<CreateProductDto> { };


export interface ReviewDto {
    firstName: string;
    lastName: string;
    review: string;
    rating: number;
    productId: string | Schema.Types.ObjectId;
};
export interface CreateReviewDto extends ReviewDto { };
export interface UpdateReviewDto extends Partial<Omit<CreateReviewDto, 'productId'>> { };