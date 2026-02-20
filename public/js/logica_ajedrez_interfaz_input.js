import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1.0.0/dist/esm/chess.js";

export class PartidaAjedrez{
  constructor(partida, lista_movimientos) {
    this.partida_chessjs = partida || new Chess();
    this.lista_movimientos = lista_movimientos || [];
  }

  getTurno(){
    return this.partida_chessjs.turn();
  }

  mover_pieza(movimiento) {
    let movimiento_valido = true;
    try {
        const completado = this.partida_chessjs.move(movimiento);

        if (completado === null) {
          throw new Error();
        }

      } catch (error) {
        console.log("Movimiento ilegal");
        movimiento_valido = false;
      }

      if(movimiento_valido){
        this.lista_movimientos.push(movimiento);
        return true;
      }

      return false;
  }

  partida_terminada(){
    return this.partida_chessjs.isGameOver();
  }

  resultado_partida(){
    if(this.getTurno() === 'w') return 'w';
    if(this.getTurno() === 'b') return 'b';
    if(this.partida_chessjs.isDraw()) return 'draw';
    if(this.partida_chessjs.isStalemate()) return 'stalemate';
    if(this.partida_chessjs.isThreefoldRepetition()) return 'threefold_repetition';
    if(this.partida_chessjs.isInsufficientMaterial()) return 'insufficient_material';
  }
}