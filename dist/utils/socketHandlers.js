"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = void 0;
const registerSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log('Client connected', socket.id);
        socket.on('join_room', (roomId) => {
            socket.join(roomId);
        });
        socket.on('message', (payload) => {
            io.to(payload.roomId).emit('message', {
                userId: payload.userId,
                message: payload.message,
                timestamp: new Date().toISOString(),
            });
        });
        socket.on('disconnect', () => {
            console.log('Client disconnected', socket.id);
        });
    });
};
exports.registerSocketHandlers = registerSocketHandlers;
