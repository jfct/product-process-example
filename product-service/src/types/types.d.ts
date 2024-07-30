import { Request } from "express";

// Param types
export type IdParams = { id: string };
export type QueryParams = { page: number, limit: number }


// API Types
export type ApiResponse<T> = {
    status: number;
    payload: T;
    error?: string;
}


// Generic types for Request with body, params and query
export interface RequestWithBody<T> extends Request {
    body: T
}

export interface RequestWithQuery<T> extends Request {
    query: T
}

export interface RequestWithParams<T> extends Request {
    params: T
}

export interface RequestWithBodyAndParams<T, U> extends Request {
    body: T,
    params: U
}

