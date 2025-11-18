import { Server as SocketIOServer, Socket } from 'socket.io';

export const registerSocketHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected', socket.id);

    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
    });

    socket.on('message', (payload: { roomId: string; message: string; userId: string }) => {
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
