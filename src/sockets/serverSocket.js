export default function serverSocket(io) {

  io.on('connect', (socket) => {
    // console.log('a user connected to partida socket', socket.id);
  
    socket.on('unirse_sala', (salaId) => {
      socket.leaveAll();

      const clientesEnSala = io.sockets.adapter.rooms.get(salaId);
      const numClientes = clientesEnSala ? clientesEnSala.size : 0;
      let rol_asignado = '';
      
      if(numClientes === 0){
        socket.emit('asignar_rol', 'white');
        rol_asignado = 'white';
      }
      else if(numClientes === 1){
        socket.emit('asignar_rol', 'black');
        rol_asignado = 'black';

      }
      else{
        socket.emit('asignar_rol', 'spectator');
        rol_asignado = 'spectator';
      }

      console.log(`Usuario ${socket.id} se unió a la sala ${salaId} como ${rol_asignado}`);
      socket.join(salaId);
    });

    socket.on('movimiento', (data) => {
      // console.log('Movimiento recibido:', data);

      socket.to(data.sala).emit('movimiento', data);
    });

  });

}
