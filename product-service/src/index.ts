import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { CachedProductDto, HttpException, IProductPopulated } from "shared";
import RedisClient from "shared/dist/clients/redis-client";

import { config } from "./config";
import Product from "./models/product.model";
import apiRouter from "./routes";

const express = require('express');
const app = express();
const redis = new RedisClient();

// Mongoose connection
mongoose.connect(config.mongodb.uri, {})
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => {
        console.error('MongoDB connection error:', error)
    });

app.use(express.json());

// Import all routes
app.use('/api', apiRouter)

// Global handler for errors
app.use(
    (
        error: Error | HttpException,
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        if (error instanceof SyntaxError && 'body' in error) {
            return res.status(400).send({ status: 'error', message: 'Invalid JSON' });
        }

        // TODO: Logging for now
        // Try to improve this later
        console.error(error);

        if (error instanceof mongoose.mongo.MongoError) {
            res.status(422).json({ status: 'error', message: error.message })
        } else if (error instanceof HttpException) {
            res.status(error.errorCode).json({ status: 'error', message: error.message });
        } else if (error) {
            res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }

        next();
    },
);

// Setup some cached products at start
initializeCache();

const PORT = process.env.PRODUCT_PORT || 3000;
app.listen(PORT, () => console.log(`Product-Service running on port ${PORT}`));

module.exports = { app };


// We get the most recent updated 5 products
async function initializeCache() {
    const products = await Product.find<IProductPopulated>()

    // Format the products for the cache
    const cachedProductList: CachedProductDto[] = products.map((product: IProductPopulated): CachedProductDto => {
        return {
            id: product.id,
            averageRating: product.averageRating,
            reviews: []
        }
    })
    await redis.setUpCache(cachedProductList);
}

