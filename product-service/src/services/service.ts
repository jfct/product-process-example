import { Document, Model } from "mongoose";

/**
 * Generic class for the classic CRUD service
 * 
 * We use T as the IGeneric interface, the Dto is usually a partial of the generic interface,
 * that has only the main components
 * THe U is the model of the service
 */
abstract class Service<T extends Document, Dto extends Partial<T>, U extends Model<T>> {
    constructor(private model: U) { }

    public async create(value: Dto): Promise<T> {
        const newObj = new this.model(value);
        return await newObj.save();
    }

    public async get(id: string): Promise<T | null> {
        return this.model.findOne({ _id: id, deleted: false }).exec();
    }

    public async update(id: string, payload: Partial<Dto>): Promise<T | null> {
        return this.model
            .findOneAndUpdate({ _id: id, deleted: false }, payload, { new: true })
            .exec();
    }

    public async delete(id: string): Promise<T | null> {
        return this.model
            .findOneAndUpdate({ _id: id, deleted: false }, { deleted: true }, { new: true })
            .exec();
    }
}

export default Service;