import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8000';

const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket']
});

export default socket;