export default function serverSocket(io) {

  io.on('connect', (socket) => {
    console.log('a user connected to partida socket', socket.id);
  
    socket.on('movimiento', (data) => {
      console.log('Movimiento recibido:', data);

      socket.broadcast.emit('movimiento', data);
    });
  });

}
