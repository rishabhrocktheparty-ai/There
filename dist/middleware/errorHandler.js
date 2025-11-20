"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.HttpError = void 0;
class HttpError extends Error {
    constructor(statusCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
    }
}
exports.HttpError = HttpError;
const errorHandler = (err, _req, res, _next) => {
    console.error(err);
    if (err instanceof HttpError) {
        return res.status(err.statusCode).json({
            error: err.message,
            details: err.details,
        });
    }
    return res.status(500).json({
        error: 'Internal server error',
    });
};
exports.errorHandler = errorHandler;
