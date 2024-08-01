import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import { IdParams, RequestWithBody, RequestWithBodyAndParams, RequestWithParams } from "../types/types";

abstract class BaseController<Dto> {
    // We use the eslint here because we would have to complicate tenfold the types just because of this service
    // I do not think it is worth it the complexity to have a type here
    // eslint-disable-next-line
    protected abstract service: any;

    public async create(req: RequestWithBody<Dto>, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ status: 'error', error: errors.array() });
            return;
        }

        try {
            const data = await this.service.create(req.body);
            res.status(201).json(data);
        } catch (error) {
            next(error);
        }
    }

    public async delete(req: RequestWithParams<IdParams>, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }

        try {
            const deletedData = await this.service.delete(req.params.id);
            if (!deletedData) {
                return res.status(404).json({ status: 'error', message: 'Id not found' });
            }
            res.status(200).json(deletedData);
        } catch (error) {
            next(error);
        }
    }

    public async update(req: RequestWithBodyAndParams<Partial<Dto>, IdParams>, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }

        try {
            const updatedData = await this.service.update(req.params.id, req.body);
            if (!updatedData) {
                return res.status(404).json({ status: 'error', message: 'Id not found' });
            }
            res.status(200).json(updatedData);
        } catch (error) {
            next(error);
        }
    }

    public async get(req: RequestWithParams<IdParams>, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const data = await this.service.get(req.params.id);
            if (!data) {
                return res.status(404).json({ status: 'error', message: 'Id not found' });
            }

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
}

export default BaseController;