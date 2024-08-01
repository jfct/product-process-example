import express from 'express';
import mongoose from 'mongoose';
import { config } from './config';
import { worker } from './workers/review.worker';

const app = express();

mongoose.connect(config.mongodb.uri, {})
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => {
        console.error('MongoDB connection error:', error)
    });

if (worker) {
    console.log('lets go');
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing worker...');
    await worker.close();
    process.exit(0);
});

app.listen(process.env.PORT || 3001, () => {
    console.log('Review service listening on port 3001');
    // Start the worker

});