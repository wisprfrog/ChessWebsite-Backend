import { Chess } from 'chess.js'

export default class Partida {
  constructor(id_sala) {
    this.id_sala = id_sala;
    this.tiempo_restante_blancas = 0.2 * 60000;
    this.tiempo_restante_negras = 0.2 * 60000;

    this.id_usuario_blancas = null;
    this.id_usuario_negras = null;

    this.tiempo_refer_blancas = Date.now();
    this.tiempo_refer_negras = Date.now();

    this.nuevo_tiempo_blancas = 0.2 * 60000;
    this.nuevo_tiempo_negras = 0.2 * 60000;
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

  getIdUsuarioBlancas(){
    return this.id_usuario_blancas;
  }

  getIdUsuarioNegras(){
    return this.id_usuario_negras;
  }

  setIdUsuarioBlancas(id_usuario){
    this.id_usuario_blancas = id_usuario;
  }

  setIdUsuarioNegras(id_usuario){
    this.id_usuario_negras = id_usuario;
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

      if(causa_fin_partida !== "Jaque Mate") ganador = "Empate";
      else ganador = this.getTurno() == 'w' ? 'Negras' : 'Blancas';
    }
    else if(this.getTiempoNuevoBlancas() <= 0 || this.getTiempoNuevoNegras() <= 0){
      causa_fin_partida = "Tiempo agotado";
      ganador = this.getTurno() == 'w' ? 'Negras' : 'Blancas';
    }

    return { causa_fin_partida, ganador };
  }
}