import { Chess } from 'chess.js'

export default class Partida {
  constructor(id_sala) {
    this.id_sala = id_sala;
    this.tiempo_restante_blancas = 600000;
    this.tiempo_restante_negras = 600000;

    this.tiempo_refer_blancas = Date.now();
    this.tiempo_refer_negras = Date.now();

    this.nuevo_tiempo_blancas = 600000;
    this.nuevo_tiempo_negras = 600000;
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

  partidaTerminada(){
    let causa_fin_partida = null;
    let ganador = null;

    if(this.partida_chess_js.isGameOver()){
      if(this.partida_chess_js.isDraw()) causa_fin_partida = "Empate";
      if(this.partida_chess_js.isCheckmate()) causa_fin_partida = "Jaque mate";
      if(this.partida_chess_js.isStalemate()) causa_fin_partida = "Rey ahogado";
      if(this.partida_chess_js.isThreefoldRepetition()) causa_fin_partida = "Repetición de posición";
      if(this.partida_chess_js.isInsufficientMaterial()) causa_fin_partida = "Material insuficiente";

      ganador = this.getTurno() == 'w' ? 'b' : 'w';
    }
    else if(this.getTiempoRestanteBlancas() <= 0 || this.getTiempoRestanteNegras() <= 0){
      causa_fin_partida = "Tiempo agotado";
      ganador = this.getTurno() == 'w' ? 'b' : 'w';
    }

    return { causa_fin_partida, ganador };
  }
}