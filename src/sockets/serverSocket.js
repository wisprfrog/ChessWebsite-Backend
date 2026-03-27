import  Partida  from '../services/Partida.js';

export default function serverSocket(io) {
  const partidas_activas = new Map();
  var usuarios_desconectados = new Array();

  io.on('connect', (socket) => {
    const nombre_usuario_conectado = socket.handshake.auth.nombre_usuario_actual;
    const sala_a_reconectar = buscarUsuarioEnPartida(nombre_usuario_conectado);

    socket.emit('intentar_reconexion', ({sala_a_reconectar, nombre_usuario_conectado }));
  
    socket.on('unirse_sala', ({sala, nombre_usuario}) => {

      socket.join(sala);

      if(!partidas_activas.has(sala)){
        partidas_activas.set(sala, new Partida(sala));
      }

      let rol_asignado = '';

      const nombre_blancas = partidas_activas.get(sala)?.getNombreUsuarioBlancas();
      const nombre_negras = partidas_activas.get(sala)?.getNombreUsuarioNegras();
      
      if(!nombre_blancas || 
        nombre_usuario === nombre_blancas){
        rol_asignado = 'white';
        socket.emit('asignar_rol', rol_asignado);
        
        partidas_activas.get(sala)?.setNombreUsuarioBlancas(nombre_usuario);
      }
      else if(!nombre_negras||
        nombre_usuario === nombre_negras){
        rol_asignado = 'black';

        socket.emit('asignar_rol', rol_asignado);
        partidas_activas.get(sala)?.setNombreUsuarioNegras(nombre_usuario);
        if(!partidas_activas.get(sala)?.getTiempoReferBlancas() || !partidas_activas.get(sala)?.getTiempoReferNegras()){
          partidas_activas.get(sala)?.setTiempoReferBlancas();
          partidas_activas.get(sala)?.setTiempoReferNegras();
        }
      }
      else{
        rol_asignado = 'spectator';
        socket.emit('asignar_rol', rol_asignado);
      }

      console.log(`Usuario ${nombre_usuario} se ha unido a la sala ${sala} con el rol de ${rol_asignado}.`);

      const fenPartida = partidas_activas.get(sala)?.partida_chess_js.fen();
      const nombre_usuario_blancas = partidas_activas.get(sala)?.getNombreUsuarioBlancas();
      const nombre_usuario_negras = partidas_activas.get(sala)?.getNombreUsuarioNegras();
      io.to(sala).emit('cargar_juego', ({fenPartida, nombre_usuario_blancas, nombre_usuario_negras}));
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
      const nombre_usuario_desconectado = socket.handshake.auth.nombre_usuario_actual;
      
      partidas_activas.forEach((partida, salaId) => {
        const nombre_usuario_blancas = partida.getNombreUsuarioBlancas();
        const nombre_usuario_negras = partida.getNombreUsuarioNegras();
        
        if(nombre_usuario_blancas === nombre_usuario_desconectado || nombre_usuario_negras === nombre_usuario_desconectado){
          usuarios_desconectados.push([salaId, nombre_usuario_desconectado]);
          console.log(`Usuario ${nombre_usuario_desconectado} se ha desconectado del socket de partida ID ${salaId}.`);
        }
      });

    });

  });

  setInterval(() => {
      partidas_activas.forEach((partida, salaId) => {
        let turno_actual = partida.getTurno();
        let nombre_usuario_blancas = partida.getNombreUsuarioBlancas();
        let nombre_usuario_negras = partida.getNombreUsuarioNegras();

        if(turno_actual === 'w' && nombre_usuario_blancas && nombre_usuario_negras) partida.calcularNuevoTiempoBlancas();
        else if (turno_actual === 'b' && nombre_usuario_blancas && nombre_usuario_negras) partida.calcularNuevoTiempoNegras();

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


      usuarios_desconectados.forEach(([salaId, nombre_usuario]) => {
        const partida = partidas_activas?.get(salaId);
      
        if(nombre_usuario === partida?.getNombreUsuarioBlancas()){
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

          usuarios_desconectados = usuarios_desconectados.filter(([sala, nombre]) => !(sala === salaId && nombre === nombre_usuario));
          
          terminarPartida(salaId);
        }
      });
    }, 1000);

    function terminarPartida(salaId){
      const partida = partidas_activas.get(salaId);
      const movimientos = partida.getHistorial();
      console.log('ID Partida se autoincrementa en base de datos');
      console.log('Usuario blancas -> ', partida.getNombreUsuarioBlancas());
      console.log('Usuario negras ->', partida.getNombreUsuarioNegras());
      console.log('Movimientos: ', movimientos);
      console.log('Ganador:', partida.partidaTerminada().ganador);
      console.log('Causa:', partida.partidaTerminada().causa_fin_partida);
      console.log('Fecha de la partida: ', new Date().toLocaleDateString());
      partidas_activas.delete(salaId);
    };

    function buscarUsuarioEnPartida(nombre_usuario){
        partidas_activas.forEach((partida, salaId) => {
          const nombre_usuario_blancas = partida.getNombreUsuarioBlancas();
          const nombre_usuario_negras = partida.getNombreUsuarioNegras();
          if(nombre_usuario_blancas === nombre_usuario || nombre_usuario_negras === nombre_usuario){
            if(nombre_usuario === nombre_usuario_blancas) partida.setTiempoReconexionBlancas(2 * 60000);
            else partida.setTiempoReconexionNegras(2 * 60000);

            return salaId;
          }
        });
        return null;
    };
  }
    
