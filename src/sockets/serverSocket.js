import  Partida  from '../services/Partida.js';
import partidaModel from '../models/partida.js';
import usuarioModel from '../models/usuario.js';
import estadisticaModel from '../models/estadistica.js';
import amigosModel from '../models/amigo.js';

export default function serverSocket(io) {
  const juego = io.of('/juego');

  const partidas_activas = new Map();
  const usuarios_desconectados = new Map(); // Map<salaId, Set<nombre_usuario>>
  const partidas_finalizando = new Set();
  let cola = new Array();
  let jugadores_en_cola = new Set();
  var sala = 0;

  juego.on('connection', (socket) => {
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
        juego.emit('partida_encontrada', {
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

        juego.to(sala).emit('cargar_juego', ({fenPartida: fenMovimiento, nombre_usuario_blancas: partida_actual.getNombreUsuarioBlancas(), nombre_usuario_negras: partida_actual.getNombreUsuarioNegras()}));
        if(partida_actual.partidaTerminada().causa_fin_partida){
          const resultado_partida = partida_actual.partidaTerminada();
          juego.to(sala).emit('terminar_partida', resultado_partida);
          terminarPartidaSeguro(sala);
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
      juego.to(sala).emit('cargar_juego', ({fenPartida, nombre_usuario_blancas, nombre_usuario_negras}));
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

        juego.to(salaId).emit('actualizar_tiempos', tiempo_restante);

        const resultado_partida = partida.partidaTerminada();
        if(resultado_partida.causa_fin_partida){
          juego.to(salaId).emit('terminar_partida', resultado_partida);
          terminarPartidaSeguro(salaId);
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
            juego.to(salaId).emit('terminar_partida', resultado_partida);

            usuarios_desconectados.delete(salaId);
            
            terminarPartidaSeguro(salaId);
          }
        });
      });
    }, 1000);

    function terminarPartidaSeguro(salaId) {
      if (partidas_finalizando.has(salaId)) {
        return;
      }

      partidas_finalizando.add(salaId);
      terminarPartida(salaId)
        .catch((error) => {
          console.error(`Error finalizando partida de la sala ${salaId}:`, error);
        })
        .finally(() => {
          partidas_finalizando.delete(salaId);
        });
    }

    async function terminarPartida(salaId){
      const partida = partidas_activas.get(salaId);
      if(!partida) return;
      
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

      try{
        ///actualizar estadisticas de los jugadores
        if(id_ganador){
          await estadisticaModel.updateEstadisticaGanadas(id_ganador);
          if(id_ganador === id_usuario_blancas){
            await estadisticaModel.updateEstadisticaPerdidas(id_usuario_negras);
          }
          else{
            await estadisticaModel.updateEstadisticaPerdidas(id_usuario_blancas);
          }
        }else{
          await estadisticaModel.updateEstadisticaTablas(id_usuario_blancas);
          await estadisticaModel.updateEstadisticaTablas(id_usuario_negras);
        }
        console.log('Estadísticas actualizadas exitosamente en la base de datos');
      }catch(error){
        console.error('Error al actualizar estadísticas: ', error);
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
          usuarios_desconectados.get(salaId)?.delete(nombre_usuario);
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

      if(sala !== null){
        console.log(`Usuario ${nombre_usuario} se encuentra en la sala ${sala}. Intentando reconexión...`);
      }

      socket.emit('intentar_reconexion', {sala_a_reconectar: sala, nombre_usuario_conectado: nombre_usuario});
    }

    function agregarUsuarioDesconectado(salaId, nombre_usuario_desconectado){
      if(!usuarios_desconectados.has(salaId)){
        usuarios_desconectados.set(salaId, new Set());
      }
      usuarios_desconectados.get(salaId).add(nombre_usuario_desconectado);
    }

    //socket para el sitio web
    const monster_chess = io.of('/monster_chess');
    let solicitud_amistad = new Map();    
    let solicitud_amistad_enviadas = new Map();

    monster_chess.on('connection', (socket) => {
      const nombre_usuario_conectado = socket.handshake.auth?.nombre_usuario_actual;

      console.log(`Usuario ${nombre_usuario_conectado} se ha conectado al namespace de Monster Chess.`);
      
      socket.on('pedir_solicitudes_amistad', ({nombre_usuario}) => {
        console.log(`Usuario ${nombre_usuario} ha solicitado sus solicitudes de amistad.`);
        socket.emit('cargar_solicitudes_amistad', ({
          nombre_usuario_destino: nombre_usuario,
          solicitudes: solicitud_amistad.has(nombre_usuario) ? Array.from(solicitud_amistad.get(nombre_usuario)) : []
        }));
      });

      socket.on('pedir_solicitudes_amistad_enviadas', ({nombre_usuario}) => {
        console.log(`Usuario ${nombre_usuario} ha solicitado sus solicitudes de amistad.`);
        socket.emit('cargar_solicitudes_amistad_enviadas', ({
          nombre_usuario_destino: nombre_usuario,
          solicitudes: solicitud_amistad_enviadas.has(nombre_usuario) ? Array.from(solicitud_amistad_enviadas.get(nombre_usuario)) : []
        }));
      });

      socket.on('enviar_solicitud_amistad', ({nombre_usuario_destino, nombre_usuario_origen}) => {
        //validar que no sean amigos ya
        
        if (!solicitud_amistad.has(nombre_usuario_destino)) {
          solicitud_amistad.set(nombre_usuario_destino, new Set());
        }

        if(!solicitud_amistad_enviadas.has(nombre_usuario_origen)){
          solicitud_amistad_enviadas.set(nombre_usuario_origen, new Set());
        }
        
        solicitud_amistad.get(nombre_usuario_destino).add(nombre_usuario_origen);
        solicitud_amistad_enviadas.get(nombre_usuario_origen).add(nombre_usuario_destino);

        monster_chess.emit('nueva_solicitud_amistad', ({nombre_usuario_destino: nombre_usuario_destino, solicitudes: Array.from(solicitud_amistad.get(nombre_usuario_destino))}));
        monster_chess.emit('cargar_solicitudes_amistad_enviadas', ({nombre_usuario_destino: nombre_usuario_origen, solicitudes: Array.from(solicitud_amistad_enviadas.get(nombre_usuario_origen))}));
        console.log(`Solicitud de amistad enviada de ${nombre_usuario_origen} a ${nombre_usuario_destino}`);
      })

      socket.on('cancelar_solicitud_amistad', ({nombre_usuario_origen, nombre_usuario_destino}) => {
        solicitud_amistad.get(nombre_usuario_destino)?.delete(nombre_usuario_origen);
        solicitud_amistad_enviadas.get(nombre_usuario_origen)?.delete(nombre_usuario_destino);
        console.log(`Solicitud de amistad cancelada de ${nombre_usuario_origen} a ${nombre_usuario_destino}`);
        
        monster_chess.emit('cargar_solicitudes_amistad', ({nombre_usuario_destino: nombre_usuario_destino, solicitudes: Array.from(solicitud_amistad.get(nombre_usuario_destino) || [])}));
        monster_chess.emit('cargar_solicitudes_amistad_enviadas', ({nombre_usuario_destino: nombre_usuario_origen, solicitudes: Array.from(solicitud_amistad_enviadas.get(nombre_usuario_origen) || [])}));
      });

      socket.on('aceptar_solicitud_amistad', async ({nombre_usuario1, nombre_usuario2}) => {
        if (solicitud_amistad.has(nombre_usuario1)) {
          solicitud_amistad.get(nombre_usuario1).delete(nombre_usuario2);

          solicitud_amistad_enviadas.get(nombre_usuario2)?.delete(nombre_usuario1);

          const id_origen = await obtenerIdUsuario(nombre_usuario1);
          const id_destino = await obtenerIdUsuario(nombre_usuario2);

          if(!id_origen || !id_destino){
            console.error(`Error al obtener IDs de usuarios para ${nombre_usuario1} y ${nombre_usuario2}. No se pudo crear la amistad.`);
            return;
          }

          console.log(`Intentando crear amistad entre ${id_origen} y ${id_destino}...`);
          const amistadCreada = await crearAmistad(id_origen, id_destino);

          if(amistadCreada){
            console.log(`Amistad creada entre ${nombre_usuario1} y ${nombre_usuario2}`);
            socket.emit('solicitud_amistad_aceptada', ({nombre_usuario1, nombre_usuario2}));
          }
          console.log(`Solicitud de amistad aceptada entre ${nombre_usuario1} y ${nombre_usuario2}`);
        }
      })
      
      socket.on('rechazar_solicitud_amistad', ({nombre_usuario_origen, nombre_usuario_destino}) => {
        if (solicitud_amistad.has(nombre_usuario_origen)) {
          solicitud_amistad.get(nombre_usuario_origen)?.delete(nombre_usuario_destino);
          solicitud_amistad_enviadas.get(nombre_usuario_destino)?.delete(nombre_usuario_origen);

          socket.emit('solicitud_amistad_rechazada', ({nombre_usuario1: nombre_usuario_origen, nombre_usuario2: nombre_usuario_destino}));
        }
        console.log(`Solicitud de amistad rechazada entre ${nombre_usuario_origen} y ${nombre_usuario_destino}`);
      })

      socket.on('disconnect', () => {
        console.log(`Usuario ${nombre_usuario_conectado} desconectado del namespace de Monster Chess`);
      });
    });

    async function obtenerIdUsuario(nombre_usuario){
      const resultado = await usuarioModel.selectIdUsuario(nombre_usuario, null);

      if(resultado.rows.length > 0) return resultado.rows[0].id_usuario;

      return null;
    }

    async function crearAmistad(id_usuario1, id_usuario2) {
      const resultado1 = await amigosModel.insertAmigo(id_usuario1, id_usuario2);
      const resultado2 = await amigosModel.insertAmigo(id_usuario2, id_usuario1);


      return resultado1.rowsAffected > 0 && resultado2.rowsAffected > 0;
    }
  }