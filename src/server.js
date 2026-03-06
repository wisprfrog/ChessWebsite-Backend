import http from 'http';
import { Server as SocketServer } from 'socket.io';
import app from './app.js';
import serverSocket from './sockets/serverSocket.js'

const PORT = 4000;

const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    // origin: 'http://192.168.0.2:3000'
    origin: 'http://localhost:3000'
  }
});


serverSocket(io);

server.listen(PORT, () => {
  console.log('Servidor corriendo en puerto', PORT);
});