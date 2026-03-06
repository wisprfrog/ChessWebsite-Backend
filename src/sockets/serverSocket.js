import  Partida  from '../services/Partida.js';

export default function serverSocket(io) {
  const partidas_activas = new Map();

  io.on('connect', (socket) => {
    // console.log('a user connected to partida socket', socket.id);
  
    socket.on('unirse_sala', (salaId) => {
      socket.leaveAll();

      const clientesEnSala = io.sockets.adapter.rooms.get(salaId);
      const numClientes = clientesEnSala ? clientesEnSala.size : 0;
      let rol_asignado = '';
      
      if(numClientes === 0) rol_asignado = 'white';
      else if(numClientes === 1){
        rol_asignado = 'black';
        
        partidas_activas.set(salaId, new Partida(salaId));
      }
      else rol_asignado = 'spectator';

      socket.to(salaId).emit('asignar_rol', rol_asignado);

      socket.join(salaId);
      console.log(`Usuario ${socket.id} se unió a la sala ${salaId} como ${rol_asignado}`);
    });

    socket.on('movimiento', (data) => {
      // console.log('Movimiento recibido:', data);

      console.log('Movimiento recibido en sala', data.sala, ':', data.fenMovimiento);

      partidas_activas.get(data.sala)?.partida_chess_js.load(data.fenMovimiento);
      
      if(partidas_activas.get(data.sala)?.getTurno() === 'w'){
        partidas_activas.get(data.sala)?.actualizarTiempoRestanteNegras(); //el turno anterior fue negro
        partidas_activas.get(data.sala)?.setTiempoReferBlancas(); //el actual es blanco
      }
      else{
        partidas_activas.get(data.sala)?.actualizarTiempoRestanteBlancas();
        partidas_activas.get(data.sala)?.setTiempoReferNegras();
      }

      socket.to(data.sala).emit('movimiento', data);
    });


    setInterval(() => {
      partidas_activas.forEach((partida, salaId) => {
        const resultado_partida = partida.partidaTerminada();

        if(resultado_partida.causa_fin_partida){
          console.log(`Partida en sala ${salaId} terminó por ${resultado_partida.causa_fin_partida}. Ganador: ${resultado_partida.ganador}`);
        }
        else{
          let turno_actual = partida.getTurno();

          if(turno_actual === 'w') partida.calcularNuevoTiempoBlancas();
          else partida.calcularNuevoTiempoNegras();

          let tiempo_restante = {
            blancas: partida.getTiempoNuevoBlancas(),
            negras: partida.getTiempoNuevoNegras()
          };

          // console.log(`Sala ${salaId} - Tiempo restante:`, tiempo_restante);
          socket.to(salaId).emit('actualizar_tiempos', tiempo_restante);
        }
      });
    }, 1000);
  });
}