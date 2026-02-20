import Chessboard from './chessboard-wrapper.js';
import { Chess } from 'https://cdn.jsdelivr.net/npm/chess.js@1.0.0/dist/esm/chess.js';
import { PartidaAjedrez } from './logica_ajedrez_interfaz_input.js';

const partida_ajedrez = new PartidaAjedrez();
window.partida_ajedrez = partida_ajedrez; // Hacemos la partida global para poder usarla en el tablero

$(document).ready(function() {
    var board = null;
    // var partida_ajedrez = new PartidaAjedrez(); // Nuestra lógica de ajedrez
    var game = new Chess(); // El motor de reglas
    var whiteSquareGrey = '#a9a9a9';
    var blackSquareGrey = '#696969';

    // --- Funciones de Resaltado ---
    function removeGreySquares () {
        $('#myBoard .square-55d63').css('background', '');
    }

    function greySquare (square) {
        var $square = $('#myBoard .square-' + square);
        var background = $square.hasClass('black-3c85d') ? blackSquareGrey : whiteSquareGrey;
        $square.css('background', background);
    }

    // --- Eventos del Tablero ---
    function onDragStart (source, piece) {
        // No permitir mover piezas si el juego terminó
        if (game.isGameOver()) return false;

        // Solo permitir mover las piezas del color al que le toca
        if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false;
        }
    }

    function onDrop (source, target) {
      removeGreySquares();

      try {
          // Intentamos realizar el movimiento
          var move = game.move({
              from: source,
              to: target,
              promotion: 'q' 
          });
          
          // Si llegamos aquí, el movimiento fue legal
          console.log('Movimiento legal: ' + move.san);
          
          partida_ajedrez.mover_pieza(move.san);
      } catch (e) {
          // Si el movimiento es ilegal, chess.js lanzará un error
          // Capturamos el error y le decimos al tablero que devuelva la pieza
          
          console.warn('Movimiento ilegal intentado de ' + source + ' a ' + target);
          return 'snapback';
      }
  }

    function onMouseoverSquare (square, piece) {
        var moves = game.moves({
            square: square,
            verbose: true
        });

        if (moves.length === 0) return;

        greySquare(square);
        for (var i = 0; i < moves.length; i++) {
            greySquare(moves[i].to);
        }
    }

    function onMouseoutSquare (square, piece) {
        removeGreySquares();
    }

    function onSnapEnd () {
        board.position(game.fen());
    }

    // --- Configuración Final ---
    var config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart, // Añadido para bloquear turnos
        onDrop: onDrop,
        onMouseoutSquare: onMouseoutSquare,
        onMouseoverSquare: onMouseoverSquare,
        onSnapEnd: onSnapEnd,
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    };

    board = Chessboard('myBoard', config);
});