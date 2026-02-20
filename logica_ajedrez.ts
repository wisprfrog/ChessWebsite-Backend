import { Chess } from 'chess.js';
import * as readline from 'readline';

const partida_ajedrez = new Chess();

function preguntar(pregunta: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(pregunta, (respuesta) => {
      rl.close();
      resolve(respuesta);
    });
  });
}

async function jugar() {
  while (!partida_ajedrez.isGameOver()) {

    console.log(partida_ajedrez.ascii());
    console.log(partida_ajedrez.moves());
    console.log('Turno de: ' + partida_ajedrez.turn());

    let movimiento_valido = false;

    while (!movimiento_valido) {
      const movimiento = await preguntar('Ingrese su movimiento: ');
      console.log("Movimiento ingresado: " + movimiento);

      try {
        const resultado = partida_ajedrez.move(movimiento);

        if (resultado === null) {
          throw new Error();
        }

        movimiento_valido = true;

      } catch (error) {
        console.log("Movimiento ilegal");
      }
    }
  }

  console.log("Juego terminado");
  if(partida_ajedrez.isCheckmate()) {
    console.log("Jaque mate! Gana: " + (partida_ajedrez.turn() === 'w' ? 'Negro' : 'Blanco'));
  }
  if(partida_ajedrez.isDraw()) {
    console.log("Empate");
  }
  if(partida_ajedrez.isStalemate()) {
    console.log("Juego sin movimientos posibles");
  }
  if(partida_ajedrez.isThreefoldRepetition()) {
    console.log("Repetición de posición tres veces");
  }
  if(partida_ajedrez.isInsufficientMaterial()) {
    console.log("Material insuficiente para ganar");
  }
}

// console.log(partida_ajedrez.ascii());
jugar();