import { NextFunction, Request, Response } from "express";

import apiRouter from "./routes";
import HttpException from "./types/errors/http-exception";

const express = require('express');
const app = express();

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
        console.log(error.message);

        if (error instanceof HttpException) {
            res.status(error.errorCode).json({ message: error.message });
        } else if (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
);


const PORT = process.env.PRODUCT_PORT || 3000;
app.listen(PORT, () => console.log(`Product-Service running on port ${PORT}`));


module.exports = { app };