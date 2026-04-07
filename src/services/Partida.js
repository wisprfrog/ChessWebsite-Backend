import { Chess } from 'chess.js'

export default class Partida {
  constructor(id_sala) {
    this.id_sala = id_sala;
    this.tiempo_restante_blancas = 10 * 60000;
    this.tiempo_restante_negras = 10 * 60000;

    this.nombre_usuario_blancas = null;
    this.nombre_usuario_negras = null;

    this.tiempo_refer_blancas = null;
    this.tiempo_refer_negras = null;

    this.nuevo_tiempo_blancas = 10 * 60000;
    this.nuevo_tiempo_negras = 10 * 60000;
    this.tiempo_reconexion_blancas = 2 * 60000;
    this.tiempo_reconexion_negras = 2 * 60000;
    this.partida_chess_js = new Chess();
  }

  getTurno(){
    return this.partida_chess_js.turn();
  }

  getTiempoRestanteBlancas(){
    return this.tiempo_restante_blancas;
  }

  getTiempoRestanteNegras(){
    return this.tiempo_restante_negras;
  }

  getTiempoNuevoBlancas(){
    return this.nuevo_tiempo_blancas;
  }

  getTiempoNuevoNegras(){
    return this.nuevo_tiempo_negras;
  }

  getNombreUsuarioBlancas(){
    return this.nombre_usuario_blancas;
  }

  getNombreUsuarioNegras(){
    return this.nombre_usuario_negras;
  }

  getTiempoReconexionBlancas(){
    return this.tiempo_reconexion_blancas;
  }

  getTiempoReconexionNegras(){
    return this.tiempo_reconexion_negras;
  }

  setTiempoReconexionBlancas(tiempo){
    this.tiempo_reconexion_blancas = tiempo;
  }

  setTiempoReconexionNegras(tiempo){
    this.tiempo_reconexion_negras = tiempo;
  }

  setNombreUsuarioBlancas(nombre_usuario){
    this.nombre_usuario_blancas = nombre_usuario;
  }

  setNombreUsuarioNegras(nombre_usuario){
    this.nombre_usuario_negras = nombre_usuario;
  }

  actualizarTiempoRestanteBlancas(){
    this.tiempo_restante_blancas = this.nuevo_tiempo_blancas;
  }

  actualizarTiempoRestanteNegras(){
    this.tiempo_restante_negras = this.nuevo_tiempo_negras;
  }

  setTiempoReferBlancas(){
    this.tiempo_refer_blancas = Date.now();
  }

  setTiempoReferNegras(){
    this.tiempo_refer_negras = Date.now();
  }

  getTiempoReferBlancas(){
    return this.tiempo_refer_blancas;
  }

  getTiempoReferNegras(){
    return this.tiempo_refer_negras;
  }

  calcularNuevoTiempoBlancas(){
    this.nuevo_tiempo_blancas = this.tiempo_restante_blancas - (Date.now() - this.tiempo_refer_blancas);
  }

  calcularNuevoTiempoNegras(){
    this.nuevo_tiempo_negras = this.tiempo_restante_negras - (Date.now() - this.tiempo_refer_negras);
  }

  getHistorial(){
    return this.partida_chess_js.history();
  }

  partidaTerminada(){
    let causa_fin_partida = null;
    let ganador = null;

    if(this.partida_chess_js.isGameOver()){
      if(this.partida_chess_js.isDraw()) causa_fin_partida = "Empate";
      if(this.partida_chess_js.isCheckmate()) causa_fin_partida = "Jaque mate";
      if(this.partida_chess_js.isStalemate()) causa_fin_partida = "Rey ahogado";
      if(this.partida_chess_js.isThreefoldRepetition()) causa_fin_partida = "Repetición de posición";
      if(this.partida_chess_js.isInsufficientMaterial()) causa_fin_partida = "Material insuficiente";

      if(causa_fin_partida !== "Jaque mate") ganador = null;
      else ganador = this.getTurno() == 'w' ? this.nombre_usuario_negras : this.nombre_usuario_blancas;
    }
    else if(this.getTiempoNuevoBlancas() <= 0 || this.getTiempoNuevoNegras() <= 0){
      causa_fin_partida = "Tiempo agotado";
      ganador = this.getTurno() == 'w' ? this.nombre_usuario_negras : this.nombre_usuario_blancas;
    }else if(this.getTiempoReconexionBlancas() <= 0 || this.getTiempoReconexionNegras() <= 0){
      causa_fin_partida = "Desconexion";
      ganador = null;
    }

    return { causa_fin_partida, ganador };
  }
}