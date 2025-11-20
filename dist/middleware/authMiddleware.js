"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const JWT_SECRET = process.env.JWT_SECRET || 'insecure_dev_secret';
const authenticate = (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return next(new errorHandler_1.HttpError(401, 'Missing or invalid authorization header'));
    }
    const token = header.split(' ')[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = payload;
        return next();
    }
    catch (err) {
        return next(new errorHandler_1.HttpError(401, 'Invalid or expired token'));
    }
};
exports.authenticate = authenticate;
const requireRole = (roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.HttpError(401, 'Unauthorized'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errorHandler_1.HttpError(403, 'Forbidden'));
        }
        return next();
    };
};
exports.requireRole = requireRole;
