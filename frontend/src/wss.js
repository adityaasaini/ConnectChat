import { io } from 'socket.io-client';

export function connectWS() {
  // Backend server URL pass karna hai
  return io('http://localhost:4600');
}