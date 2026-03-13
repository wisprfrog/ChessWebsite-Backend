import http from 'http';
import { Server as SocketServer } from 'socket.io';
import app from './app.js';
import serverSocket from './sockets/serverSocket.js'

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: [
       //'http://192.168.0.1:3000',
       'http://localhost:3000',
      //'https://monsterchessofclansfrontend.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // Permitir el envío de cookies para la autenticación si es necesario 
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 60000,
    skipMiddlewares: true
  }
});


serverSocket(io);

server.listen(PORT, '0.0.0.0', () => {
  console.log('Servidor corriendo en puerto', PORT);
});