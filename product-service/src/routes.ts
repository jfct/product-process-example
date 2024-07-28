import { Router } from 'express';
import productRouter from './routes/product.routes';
import reviewRouter from './routes/review.routes';

const apiRouter = Router();

apiRouter.use('/product', productRouter);
apiRouter.use('/review', reviewRouter);

export default apiRouter;