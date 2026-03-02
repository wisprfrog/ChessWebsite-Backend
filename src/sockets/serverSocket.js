export default function serverSocket(io) {

  io.on('connect', (socket) => {
    // console.log('a user connected to partida socket', socket.id);
  
    socket.on('unirse_sala', (salaId) => {
      socket.leaveAll();

      // console.log(`Usuario ${socket.id} se unió a la sala ${salaId}`);
      socket.join(salaId);
    });

    socket.on('movimiento', (data) => {
      // console.log('Movimiento recibido:', data);

      socket.to(data.sala).emit('movimiento', data);
    });
  });

}
