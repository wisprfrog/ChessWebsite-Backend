import  Partida  from '../services/Partida.js';

export default function serverSocket(io) {
  const partidas_activas = new Map();

  io.on('connect', (socket) => {
    // console.log('a user connected to partida socket', socket.id);
    const id_usuario_conectado = socket.handshake.auth.id_usuario_actual;
    const sala_a_reconectar = buscarUsuarioEnPartida(id_usuario_conectado);

    socket.emit('intentar_reconexion', ({sala_a_reconectar, id_usuario_conectado }));
  
    socket.on('unirse_sala', ({sala, id_usuario}) => {

      socket.join(sala);

      if(!partidas_activas.has(sala)){
        partidas_activas.set(sala, new Partida(sala));
      }

      let rol_asignado = '';

      const id_blancas = partidas_activas.get(sala)?.getIdUsuarioBlancas();
      const id_negras = partidas_activas.get(sala)?.getIdUsuarioNegras();
      
      if(!id_blancas || 
        id_usuario === id_blancas){
        rol_asignado = 'white';
        socket.emit('asignar_rol', rol_asignado);
        
        partidas_activas.get(sala)?.setIdUsuarioBlancas(id_usuario);
      }
      else if(!id_negras||
        id_usuario === id_negras){
        rol_asignado = 'black';

        socket.emit('asignar_rol', rol_asignado);
        partidas_activas.get(sala)?.setIdUsuarioNegras(id_usuario);
      }
      else{
        rol_asignado = 'spectator';
        socket.emit('asignar_rol', rol_asignado);
      }

      const fenPartida = partidas_activas.get(sala)?.partida_chess_js.fen();
      socket.emit('cargar_juego', (fenPartida));
    });

    socket.on('movimiento', (data) => {
      // console.log('Movimiento recibido en sala', data.sala, ':', data.fenMovimiento);

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
      if(partidas_activas.get(data.sala)?.partidaTerminada().causa_fin_partida){
        const resultado_partida = partidas_activas.get(data.sala)?.partidaTerminada();
        io.to(data.sala).emit('partida_terminada', resultado_partida);
        terminarPartida(data.sala);
      }
    });

  });

  setInterval(() => {
      partidas_activas.forEach((partida, salaId) => {
        let turno_actual = partida.getTurno();
        let id_usuario_blancas = partida.getIdUsuarioBlancas();
        let id_usuario_negras = partida.getIdUsuarioNegras();

        if(turno_actual === 'w' && id_usuario_blancas && id_usuario_negras) partida.calcularNuevoTiempoBlancas();
        else if (turno_actual === 'b' && id_usuario_blancas && id_usuario_negras) partida.calcularNuevoTiempoNegras();

        let tiempo_restante = {
          blancas: partida.getTiempoNuevoBlancas(),            
          negras: partida.getTiempoNuevoNegras()
        };

        // console.log(`Sala ${salaId} - Tiempo restante:`, tiempo_restante);
        io.to(salaId).emit('actualizar_tiempos', tiempo_restante);

        const resultado_partida = partida.partidaTerminada();
        if(resultado_partida.causa_fin_partida){
          console.log(`Partida en sala ${salaId} terminó por ${resultado_partida.causa_fin_partida}. Ganador: ${resultado_partida.ganador}`);
          io.to(salaId).emit('partida_terminada', resultado_partida);
          terminarPartida(salaId);
        }
      });
    }, 1000);

    function terminarPartida(salaId){
      const partida = partidas_activas.get(salaId);
      console.log('ID Partida se autoincrementa en base de datos');
      console.log('Usuario blancas ->');
      console.log('Usuario negras ->');
      console.log('Movimientos: ', partida.getHistorial())
      console.log('Ganador:', partida.partidaTerminada().ganador);
      console.log('Causa:', partida.partidaTerminada().causa_fin_partida);
      console.log('Fecha de la partida: ', new Date().toLocaleDateString());
      partidas_activas.delete(salaId);
    };

    function buscarUsuarioEnPartida(id_usuario){
        partidas_activas.forEach((partida, salaId) => {
          if(partida.getIdUsuarioBlancas() === id_usuario || partida.getIdUsuarioNegras() === id_usuario){
            return salaId;
          }
        });
        return null;
    };
  }
    
