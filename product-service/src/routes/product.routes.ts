import { Router } from 'express';
import ProductController from '../controller/product.controller';
import { createProductValidation, updateProductValidation } from '../validations/product.validation';
import { idValidation, listValidation } from '../validations/validation';

const productRouter = Router();
const productController = new ProductController();

// Using .bind to maintain `this` context
productRouter.get('/', listValidation, productController.listProducts.bind(productController));
productRouter.get('/:id', idValidation, productController.get.bind(productController));
productRouter.get('/reviews/:id', idValidation, productController.listReviewsForProduct.bind(productController));

productRouter.post('/', createProductValidation, productController.create.bind(productController));

productRouter.put('/:id', [...idValidation, ...updateProductValidation], productController.update.bind(productController));

productRouter.delete('/:id', idValidation, productController.delete.bind(productController));

export default productRouter;