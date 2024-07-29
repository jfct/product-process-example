import { Router } from 'express';
import ProductController from '../controller/product.controller';
import { createProductValidation, idValidation, listValidation, updateProductValidation } from '../validations/product.validation';

const productRouter = Router();
const productController = new ProductController();

// Using .bind to maintain `this` context
productRouter.get('/', listValidation, productController.listProducts.bind(productController));
productRouter.post('/', createProductValidation, productController.createProduct.bind(productController));
productRouter.get('/:id', idValidation, productController.getProductById.bind(productController));
productRouter.put('/:id', [...idValidation, ...updateProductValidation], productController.updateProduct.bind(productController));
productRouter.delete('/:id', idValidation, productController.deleteProduct.bind(productController));

export default productRouter;