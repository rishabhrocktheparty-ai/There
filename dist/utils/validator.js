"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const validateBody = (schema) => {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return next(new errorHandler_1.HttpError(400, 'Validation failed', result.error.flatten()));
        }
        req.body = result.data;
        next();
    };
};
exports.validateBody = validateBody;
