"use strict";
// Simple logger utility
// Can be extended with Winston or other logging libraries
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
class Logger {
    log(level, message, meta) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        if (meta) {
            console[level](logMessage, meta);
        }
        else {
            console[level](logMessage);
        }
    }
    info(message, meta) {
        this.log('info', message, meta);
    }
    warn(message, meta) {
        this.log('warn', message, meta);
    }
    error(message, meta) {
        this.log('error', message, meta);
    }
    debug(message, meta) {
        if (process.env.NODE_ENV !== 'production') {
            this.log('debug', message, meta);
        }
    }
}
exports.logger = new Logger();
