import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { config } from "./config";
import apiRouter from "./routes";
import HttpException from "./types/errors/http-exception";

const express = require('express');
const app = express();

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


const PORT = process.env.PRODUCT_PORT || 3000;
app.listen(PORT, () => console.log(`Product-Service running on port ${PORT}`));


module.exports = { app };