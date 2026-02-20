$(document).ready(function() {
    
    function onDrop (source, target, piece, newPos, oldPos, orientation) {
      console.log('Pieza: ' + piece)
      console.log('Desde: ' + source)
      console.log('Hacia: ' + target)
      console.log('Nueva posición FEN: ' + Chessboard.objToFen(newPos))
      console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    }

    var config = {
      draggable: true,
      position: 'start',
      onDrop: onDrop,
      sparePieces: true,
      // IMPORTANTE: Sin esta línea no verás las piezas
      pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    }

    // Esto ahora funcionará porque esperamos a que el documento esté listo
    var board = Chessboard('myBoard', config)
});