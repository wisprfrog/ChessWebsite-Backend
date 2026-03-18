import  Partida  from '../services/Partida.js';

export default function serverSocket(io) {
  const partidas_activas = new Map();
  var usuarios_desconectados = new Array();

  io.on('connect', (socket) => {
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
        if(!partidas_activas.get(sala)?.getTiempoReferBlancas() || !partidas_activas.get(sala)?.getTiempoReferNegras()){
          partidas_activas.get(sala)?.setTiempoReferBlancas();
          partidas_activas.get(sala)?.setTiempoReferNegras();
        }
      }
      else{
        rol_asignado = 'spectator';
        socket.emit('asignar_rol', rol_asignado);
      }

      const fenPartida = partidas_activas.get(sala)?.partida_chess_js.fen();
      socket.emit('cargar_juego', (fenPartida));
    });

    socket.on('movimiento', (data) => {
      const partida_actual = partidas_activas.get(data.sala);

      partida_actual.partida_chess_js?.move(data.estructura_movimiento);
      
      if(partida_actual.getTurno() === 'w'){
        partida_actual.actualizarTiempoRestanteNegras(); //el turno anterior fue negro
        partida_actual.setTiempoReferBlancas(); //el actual es blanco
      }
      else{
        partida_actual.actualizarTiempoRestanteBlancas();
        partida_actual.setTiempoReferNegras();
      }

      const fenMovimiento = partida_actual.partida_chess_js?.fen();

      socket.to(data.sala).emit('movimiento', fenMovimiento);
      if(partida_actual.partidaTerminada().causa_fin_partida){
        const resultado_partida = partida_actual.partidaTerminada();
        io.to(data.sala).emit('terminar_partida', resultado_partida);
        terminarPartida(data.sala);
      }
    });

    socket.on('disconnect', () => {
      const id_usuario_desconectado = socket.handshake.auth.id_usuario_actual;
      const salaId = buscarUsuarioEnPartida(id_usuario_desconectado);
      console.log(`Usuario ${id_usuario_desconectado} se ha desconectado del socket de partidas.`);

      partidas_activas.forEach((partida, salaId) => {
        const id_usuario_blancas = partida.getIdUsuarioBlancas();
        const id_usuario_negras = partida.getIdUsuarioNegras();

        if(id_usuario_blancas === id_usuario_desconectado || id_usuario_negras === id_usuario_desconectado){
            usuarios_desconectados.push([salaId, id_usuario_desconectado]);
        }
      });

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

        io.to(salaId).emit('actualizar_tiempos', tiempo_restante);

        const resultado_partida = partida.partidaTerminada();
        if(resultado_partida.causa_fin_partida){
          io.to(salaId).emit('terminar_partida', resultado_partida);
          terminarPartida(salaId);
        }
      });


      usuarios_desconectados.forEach(([salaId, id_usuario]) => {
        const partida = partidas_activas?.get(salaId);
      
        if(id_usuario === partida?.getIdUsuarioBlancas()){
          const tiempo_blancas = partida?.getTiempoReconexionBlancas() - 1000;
          partida?.setTiempoReconexionBlancas(tiempo_blancas);
        }
        else{
          const tiempo_negras = partida?.getTiempoReconexionNegras() - 1000;
          partida?.setTiempoReconexionNegras(tiempo_negras);
        }
        
        const resultado_partida = partida?.partidaTerminada(); 
        if(resultado_partida?.causa_fin_partida || resultado_partida?.ganador){
          io.to(salaId).emit('terminar_partida', resultado_partida);

          usuarios_desconectados = usuarios_desconectados.filter(([sala, id]) => !(sala === salaId && id === id_usuario));
          
          terminarPartida(salaId);
        }
      });
    }, 1000);

    function terminarPartida(salaId){
      const partida = partidas_activas.get(salaId);
      const movimientos = partida.getHistorial();
      console.log('ID Partida se autoincrementa en base de datos');
      console.log('Usuario blancas -> ', partida.getIdUsuarioBlancas());
      console.log('Usuario negras ->', partida.getIdUsuarioNegras());
      console.log('Movimientos: ', movimientos);
      console.log('Ganador:', partida.partidaTerminada().ganador);
      console.log('Causa:', partida.partidaTerminada().causa_fin_partida);
      console.log('Fecha de la partida: ', new Date().toLocaleDateString());
      partidas_activas.delete(salaId);
    };

    function buscarUsuarioEnPartida(id_usuario){
        partidas_activas.forEach((partida, salaId) => {
          const id_usuario_blancas = partida.getIdUsuarioBlancas();
          const id_usuario_negras = partida.getIdUsuarioNegras();
          if(id_usuario_blancas === id_usuario || id_usuario_negras === id_usuario){
            if(id_usuario === id_usuario_blancas) partida.setTiempoReconexionBlancas(2 * 60000);
            else partida.setTiempoReconexionNegras(2 * 60000);

            return salaId;
          }
        });
        return null;
    };
  }
    
