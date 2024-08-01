import dotenv from 'dotenv';

dotenv.config();

export const config = {
    mongodb: {
        // Use 'localhost' if debugging without docker
        // uri: `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PWD}@localhost:27017/${process.env.MONGODB_DB}?authSource=admin`
        uri: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@${process.env.MONGO_HOST}:27017/${process.env.MONGO_DB}?authSource=admin`
    },
};