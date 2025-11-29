import { io, Socket } from 'socket.io-client';
const apiUrl = import.meta.env.VITE_API_SOCKET_URL;


const SOCKET_URL = apiUrl;

const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket']
});

export default socket;