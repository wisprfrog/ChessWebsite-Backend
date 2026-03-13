import 'dotenv/config';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import app from './app.js';
import serverSocket from './sockets/serverSocket.js';

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const io = new SocketServer(server, {

  cors: {
    origin: [
      // 'http://192.168.0.2:3000',
      // 'http://localhost:3000',
      'https://monsterchessofclansfrontend.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // Permitir el envío de cookies para la autenticación si es necesario 
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 600,
    skipMiddlewares: true
  }
});

const SECRET_KEY = process.env.JWT_SECRET
// const SECRET_KEY = process.env.TURSO_AUTH_TOKEN

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Acceso denegado"));

  jwt.verify(token, SECRET_KEY, (err, decodedUser) => {
    if (err) return next(new Error("Token inválido"));
    socket.user = decodedUser; 
    next();
  });
});

// 4. Lógica de conexiones en tiempo real
io.on('connection', (socket) => {
  console.log(`🟢 Jugador conectado: ${socket.user.username}`);

  socket.on('unirse_sala', (sala) => {
    socket.join(sala);
    console.log(`${socket.user.username} entró a la sala ${sala}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Jugador desconectado: ${socket.user.username}`);
  });
});

serverSocket(io);

server.listen(PORT, '0.0.0.0', () => {
  console.log('Servidor corriendo en puerto', PORT);
});
