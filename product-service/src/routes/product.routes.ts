import { Router } from 'express';
import ProductController from '../controller/product.controller';

const productRouter = Router();
const productController = new ProductController();

productRouter.get('/', productController.listProducts.bind(productController));
productRouter.post('/', productController.createProduct.bind(productController));
productRouter.get('/:id', productController.getProductById.bind(productController));
productRouter.put('/:id', productController.updateProduct.bind(productController));
productRouter.delete('/:id', productController.deleteProduct.bind(productController));

export default productRouter;