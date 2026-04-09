import  Partida  from '../services/Partida.js';
import partidaModel from '../models/partida.js';
import usuarioModel from '../models/usuario.js';

export default function serverSocket(io) {
  const partidas_activas = new Map();
  var usuarios_desconectados = new Map(); //cambio de set a map para guardar la tupla jugador-sala
  let cola = new Array();
  let jugadores_en_cola = new Set();
  var sala = 0;

  io.on('connection', (socket) => {
    const nombre_usuario_conectado = socket.handshake.auth?.nombre_usuario_actual;
    
    if(!nombre_usuario_conectado){
      console.log('Conexion sin auth');
      socket.disconnect();
      return;
    }

    console.log(`Usuario ${nombre_usuario_conectado} se ha conectado.`);
    
    buscarSocketSala(socket, nombre_usuario_conectado); 

    socket.on('buscar_partida', (nombre_jugador) => {
      if(!jugadores_en_cola.has(nombre_jugador)){
        jugadores_en_cola.add(nombre_jugador);
        cola.push(nombre_jugador);
      }

      if(cola.length >= 2){
        const nom_jugador1 = cola.shift();
        const nom_jugador2 = cola.shift();
        jugadores_en_cola.delete(nom_jugador1);
        jugadores_en_cola.delete(nom_jugador2);

        console.log(`Partida encontrada entre ${nom_jugador1} y ${nom_jugador2} en la sala ${sala}.`);
        io.emit('partida_encontrada', {
          sala_asignada: sala.toString(),
          nombre_usuario1: nom_jugador1,
          nombre_usuario2: nom_jugador2
        });

        sala++;
      }
    })

    socket.on('movimiento', ({estructura_movimiento, sala}) => {
      const partida_actual = partidas_activas.get(sala);

      if(!partida_actual) console.log(`No se encontró la partida para la sala ${sala}. Movimiento no procesado.`);
      else{
        console.log(`Movimiento recibido en la sala ${sala}`);

        try{
          partida_actual.partida_chess_js?.move(estructura_movimiento);
        } catch (error) {
          console.error('Movimiento invalido, error:', error);
          return;
        }

        if(partida_actual.getTurno() === 'w'){
          partida_actual.actualizarTiempoRestanteNegras(); //el turno anterior fue negro
          partida_actual.setTiempoReferBlancas(); //el actual es blanco
        }
        else{
          partida_actual.actualizarTiempoRestanteBlancas();
          partida_actual.setTiempoReferNegras();
        }

        const fenMovimiento = partida_actual.partida_chess_js?.fen();

        io.to(sala).emit('cargar_juego', ({fenPartida: fenMovimiento, nombre_usuario_blancas: partida_actual.getNombreUsuarioBlancas(), nombre_usuario_negras: partida_actual.getNombreUsuarioNegras()}));
        if(partida_actual.partidaTerminada().causa_fin_partida){
          const resultado_partida = partida_actual.partidaTerminada();
          io.to(sala).emit('terminar_partida', resultado_partida);
          terminarPartida(sala);
        }
      }
    });

    socket.on('unirse_sala', ({sala, nombre_jugador}) => {
      socket.join(sala);

      if(!partidas_activas.has(sala)){
        partidas_activas.set(sala, new Partida(sala));
      }

      let rol_asignado = '';

      const nombre_blancas = partidas_activas.get(sala)?.getNombreUsuarioBlancas();
      const nombre_negras = partidas_activas.get(sala)?.getNombreUsuarioNegras();
      
      if(!nombre_blancas || 
        nombre_jugador === nombre_blancas){
        rol_asignado = 'white';
        socket.emit('asignar_rol', rol_asignado);
        
        partidas_activas.get(sala)?.setNombreUsuarioBlancas(nombre_jugador);
      }
      else if(!nombre_negras||
        nombre_jugador === nombre_negras){
        rol_asignado = 'black';

        socket.emit('asignar_rol', rol_asignado);
        partidas_activas.get(sala)?.setNombreUsuarioNegras(nombre_jugador);
        if(!partidas_activas.get(sala)?.getTiempoReferBlancas() || !partidas_activas.get(sala)?.getTiempoReferNegras()){
          partidas_activas.get(sala)?.setTiempoReferBlancas();
          partidas_activas.get(sala)?.setTiempoReferNegras();
        }
      }
      else{
        rol_asignado = 'spectator';
        socket.emit('asignar_rol', rol_asignado);
      }

      console.log(`Usuario ${nombre_jugador} se ha unido a la sala ${sala} con el rol de ${rol_asignado}.`);

      const fenPartida = partidas_activas.get(sala)?.partida_chess_js.fen();
      const nombre_usuario_blancas = partidas_activas.get(sala)?.getNombreUsuarioBlancas();
      const nombre_usuario_negras = partidas_activas.get(sala)?.getNombreUsuarioNegras();
      io.to(sala).emit('cargar_juego', ({fenPartida, nombre_usuario_blancas, nombre_usuario_negras}));
    });

    socket.on('disconnect', () => {
      const nombre_usuario_desconectado = socket.handshake.auth?.nombre_usuario_actual;
      
      partidas_activas.forEach((partida, salaId) => {
        const nombre_usuario_blancas = partida.getNombreUsuarioBlancas();
        const nombre_usuario_negras = partida.getNombreUsuarioNegras();
        
        if(nombre_usuario_blancas === nombre_usuario_desconectado || nombre_usuario_negras === nombre_usuario_desconectado){
          agregarUsuarioDesconectado(salaId, nombre_usuario_desconectado);
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


      usuarios_desconectados.forEach((nombres_usuarios, salaId) => {
        const partida = partidas_activas?.get(salaId);
        
        nombres_usuarios.forEach((nombre_usuario) => {
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

            usuarios_desconectados.delete(salaId);
            
            terminarPartida(salaId);
          }
        });
      });
    }, 1000);

    async function terminarPartida(salaId){
      const partida = partidas_activas.get(salaId);
      
      //DATOS A GUARDAR EN LA BASE DE DATOS
      //Preparando id usuarios
      const nombre_usuario_blancas = partida.getNombreUsuarioBlancas();
      const nombre_usuario_negras = partida.getNombreUsuarioNegras();
      
      const resultado_blancas = await usuarioModel.selectIdUsuario(nombre_usuario_blancas, null);
      const resultado_negras = await usuarioModel.selectIdUsuario(nombre_usuario_negras, null);

      const id_usuario_blancas = resultado_blancas.rows[0]?.id_usuario;
      const id_usuario_negras = resultado_negras.rows[0]?.id_usuario;
      
      //Movimientos
      const movimientos = partida.getHistorial();

      //Resultado partida (causa y id ganador)
      const ganador = partida.partidaTerminada().ganador;
      let id_ganador = null;
      if(ganador){
        id_ganador = ganador === nombre_usuario_blancas ? id_usuario_blancas : id_usuario_negras;
      }

      //Fecha
      const fecha = new Date().toLocaleDateString();
      const causa_fin_partida = partida.partidaTerminada().causa_fin_partida;

      console.log(`Intentando guardar partida de la sala ${salaId} en la base de datos con los siguientes datos:
        id_usuario_blancas: ${id_usuario_blancas},
        id_usuario_negras: ${id_usuario_negras},
        movimientos: ${JSON.stringify(movimientos)},
        id_ganador: ${id_ganador},
        fecha: ${fecha},
        causa_fin_partida: ${causa_fin_partida}
      `);
      
      try{
        await partidaModel.insertPartida(
          id_usuario_blancas,
          id_usuario_negras,
          movimientos,
          id_ganador,
          fecha, causa_fin_partida
        );

        console.log('Partida guardada exitosamente en la base de datos: ');
      }
      catch(error){
        console.error('Error al guardar partida en la base de datos: ', error);
      }

      partidas_activas.delete(salaId);
    };

    function buscarUsuarioEnPartida(nombre_usuario){
      let salaIdEncontrada = null;

      console.log(`Buscando partidas para el usuario ${nombre_usuario}...`);
      partidas_activas.forEach((partida, salaId) => {
        const nombre_usuario_blancas = partida.getNombreUsuarioBlancas();
        const nombre_usuario_negras = partida.getNombreUsuarioNegras();
        
        if(nombre_usuario_blancas == nombre_usuario || nombre_usuario_negras == nombre_usuario){
          // quitamos al usuario de la lista de desconectados para esa sala, si es que estaba
          usuarios_desconectados.get(salaId)?.splice(usuarios_desconectados.get(salaId).indexOf(nombre_usuario), 1);
          if(nombre_usuario == nombre_usuario_blancas){ 
            partida.setTiempoReconexionBlancas(2 * 60000);
          }else{
            partida.setTiempoReconexionNegras(2 * 60000);
          }

          salaIdEncontrada = salaId;
        }
      });

      return salaIdEncontrada;
    };

    function buscarSocketSala(socket, nombre_usuario){
      const sala = buscarUsuarioEnPartida(nombre_usuario);

      console.log('Sala encontrada para el usuario ', nombre_usuario, ': ', sala);
      if(sala !== null){
        console.log(`Usuario ${nombre_usuario} se encuentra en la sala ${sala}. Intentando reconexión...`);
      }

      socket.emit('intentar_reconexion', {sala_a_reconectar: sala, nombre_usuario_conectado: nombre_usuario});
    }

    function agregarUsuarioDesconectado(salaId, nombre_usuario_desconectado){
      if(!usuarios_desconectados.has(salaId)){
        usuarios_desconectados.set(salaId, []);
      }
      usuarios_desconectados.get(salaId).push(nombre_usuario_desconectado);
    }
  }