"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const notFoundHandler = (req, res, _next) => {
    res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
};
exports.notFoundHandler = notFoundHandler;
