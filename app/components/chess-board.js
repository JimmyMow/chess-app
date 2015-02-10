import Ember from 'ember';
import InboundActions from 'ember-component-inbound-actions/inbound-actions';

export default Ember.Component.extend(InboundActions, {
  tag: 'div',
  classNames: ['chess-board'],
  board: null,
  game: null,
  actions: {
    updateYourPgn: function() {
      var board = this.get('board');
      var game = this.get('game');
      board.updatePgn(game.history());
    },

    resetBoardAndGame: function() {
      this.get('board').start();
      this.get('game').reset();
    },

    resetBoardStyles: function() {
      Ember.$('.pgn').empty();
      Ember.$('.square-55d63').removeClass('was-part-of-last-move');
    },

    undoMove: function() {
      var game = this.get('game');
      var board = this.get('board');

      game.undo();
      board.position(game.fen());
      Ember.$('.square-55d63').removeClass('was-part-of-last-move');
    }
  },
  removeGreySquares: function() {
    Ember.$('#board .square-55d63').css('background', '');
  },
  greySquare: function(square) {
    var squareEl = Ember.$('#board .square-' + square);

    var background = '';
    if (squareEl.hasClass('black-3c85d') === true) {
      background = '';
    }

    // squareEl.css('background', background);
  },
  possibleMoves: function(square) {
    var squareData = this.component.get('game').get(square);
    var squareEl = Ember.$('#board .square-' + square);
    var background;

    if (squareData) {
      background = 'radial-gradient(rgba(240, 217, 181, 1) 0%,rgba(240, 217, 181, 1) 80%,rgba(255, 115, 0, 0.5) 80%)';
      if (squareEl.hasClass('black-3c85d') === true) {
        background = 'radial-gradient(rgba(181, 136, 99, 1) 0%,rgba(181, 136, 99, 1) 80%,rgba(255, 115, 0, 0.5) 80%)';
      }
    } else {
      background = 'radial-gradient(rgba(255, 115, 0, 0.5) 22%,#208530 0,rgba(0,0,0,0.5) 0,rgba(240, 217, 181, 1) 0)';
      if (squareEl.hasClass('black-3c85d') === true) {
        background = 'radial-gradient(rgba(255, 115, 0, 0.5) 22%,#208530 0,rgba(0,0,0,0.5) 0,rgba(181, 136, 99, 1) 0';
      }
    }

    var backgroundColor = 'rgba(0, 0, 0, 0)';

    squareEl.css('background', background);
    squareEl.css('background-color', backgroundColor);
  },
  onDragStart: function(source, piece, position, orientation) {
    var game = this.component.get('game');
    if (game.game_over() === true ||
        (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return false;
    }
  },
  onDrop: function(source, target) {
    var game = this.component.get('game');
    var from = Ember.$('.square-'+source);
    var to = Ember.$('.square-'+target);
    var allSquares = Ember.$('.square-55d63');

    this.removeGreySquares();

    // see if the move is legal
    var move = game.move({
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for example simplicity
    });

    // Add most recent squares highlight after piece was dropped
    if (source !== target && move) {
      allSquares.removeClass('was-part-of-last-move');
      from.addClass('was-part-of-last-move');
      to.addClass('was-part-of-last-move');
    }

    // illegal move
    if (move === null) {
      return 'snapback';
    }

    this.component.get('board').updatePgn(game.history());

    this.sendPosition(game.fen(), move.from, move.to, game.history());
    Ember.$('.engine-data').text('');
  },
  onSnapEnd: function() {
    var board = this.component.get('board');
    var game = this.component.get('game');
    board.position(game.fen());
  },
  onMouseoverSquare: function(square, piece) {
    var game = this.component.get('game');
    // get list of possible moves for this square
    var moves = game.moves({
      square: square,
      verbose: true
    });

    // exit if there are no moves available for this square
    if (moves.length === 0) {
      return;
    }

    // highlight the square they moused over
    this.greySquare(square);
    Ember.$('square-55d63').css('background-color', '');
    // highlight the possible squares for this piece
    for (var i = 0; i < moves.length; i++) {
      this.possibleMoves(moves[i].to);
    }
  },
  onMouseoutSquare: function(square, piece) {
    this.removeGreySquares();
  },
  updateStatus: function() {
    var game = this.component.get('game');
    var status = '';

    var moveColor = 'White';
    if (game.turn() === 'b') {
      moveColor = 'Black';
    }

    // checkmate?
    if (game.in_checkmate() === true) {
      status = 'Game over, ' + moveColor + ' is in checkmate.';
    }
    // draw?
    else if (game.in_draw() === true) {
      status = 'Game over, drawn position';
    }

    // game still on
    else {
      status = moveColor + ' to move';

      // check?
      if (game.in_check() === true) {
        status += ', ' + moveColor + ' is in check';
      }
    }

    Ember.$('.pgn').html(game.pgn());
  },
  buildTurnHtml: function(index, whiteMove, blackMove) {
    var result;
    var indexSpan = "<span class='index'>" + index + "</span>";
    var whiteMoveLink = "<a class='move'>" + whiteMove + "</a>";
    var blackMoveLink = "<a class='move'>" + blackMove + "</a>";

    if (blackMove) {
      result = "<div class='turn'>" + indexSpan + whiteMoveLink + blackMoveLink + "</div>";
    } else {
      result = "<div class='turn'>" + indexSpan + whiteMoveLink + "</div>";
    }
    return result;
  },
  updatePgn: function(history) {
    Ember.$('.pgn').empty();
    var turn_count = 1;
    for( var i = 0; i < history.length; i = i + 2 ) {
      // Get turn data
      var turnNum = turn_count;
      var whitesMove = history[i];
      var blacksMove = history[i + 1];

      // Build turn HTML
      var newTurn = this.buildTurnHtml(turnNum, whitesMove, blacksMove);
      // Append HTML to PGN
      Ember.$('.pgn').append(newTurn);
      Ember.$('.pgn')[0].scrollTop = Ember.$('.pgn')[0].scrollHeight;
      // Bump upp turn counter
      turn_count = turn_count + 1;
    }
  },
  didInsertElement: function() {
    var _this = this;
    var newGame = new Chess();
    var newBoard = new ChessBoard('board', {
      component: _this,
      dropOffBoard: 'trash',
      draggable: true,
      position: 'start',
      onDragStart: this.get('onDragStart'),
      onDrop: this.get('onDrop'),
      onMouseoutSquare: this.get('onMouseoutSquare'),
      onMouseoverSquare: this.get('onMouseoverSquare'),
      onSnapEnd: this.get('onSnapEnd'),
      removeGreySquares: this.get('removeGreySquares'),
      greySquare: this.get('greySquare'),
      possibleMoves: this.get('possibleMoves'),
      updateStatus: this.get('updateStatus'),
      sendPosition: function(fen, from, to, history) {
        _this.sendAction('action', {fen: fen, from: from, to: to, history: history});
      }
    });

    newBoard.buildTurnHtml = this.get('buildTurnHtml');
    newBoard.updatePgn = this.get('updatePgn');

    this.set('board', newBoard);
    this.set('game', newGame);
  }
});
