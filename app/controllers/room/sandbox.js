import Ember from 'ember';

export default Ember.Controller.extend({
  boardObject: null,
  gameObject: null,
  diagramMode: false,
  stockfishAnalysis: false,
  actions: {
    sendPosition: function(data) {
      data.stockfish = this.get('stockfishAnalysis');
      this.socket.emit('sendPosition', data);
    },

    sendDiagram: function(data) {
      this.socket.emit('send diagram', data);
    },

    start: function() {
      this.get('boardObject').start();
      this.get('gameObject').reset();
      this.socket.emit('startingGameOver');
      Ember.$('.engine-data').text('');
      Ember.$('.pgn').empty();
      Ember.$('.square-55d63').removeClass('was-part-of-last-move');
    },

    canvas: function() {
      if (this.get('diagramMode')) {
        Ember.$('canvas').removeClass('diagram-mode');
        this.set('diagramMode', false);
        this.socket.emit('turn off diagram mode');
      } else {
        Ember.$('canvas').addClass('diagram-mode');
        this.set('diagramMode', true);
        this.socket.emit('turn on diagram mode');
      }
    },

    clearCanvas: function() {
      var context = document.getElementById('diagram').getContext('2d');
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      this.socket.emit('clear diagram');
    },

    updateCheckedStatus: function(data) {
      var game = this.get('gameObject');
      if (data.isChecked) {
        this.set('stockfishAnalysis', true);
        this.socket.emit('start analyzing', { fen: game.fen() });
      } else {
        this.set('stockfishAnalysis', false);
        this.socket.emit('stop analyzing');
      }
    }
  },

  sockets: {
    changePosition: function(obj) {
      this.get('boardObject').position(obj.fen);
      this.get('gameObject').load_pgn(obj.history.join(" "));
      this.get('sendPgnUpdate').send('updateYourPgn');
      Ember.$('.square-55d63').removeClass('was-part-of-last-move');
      var from = Ember.$('.square-'+obj.from);
      var to = Ember.$('.square-'+obj.to);
      from.addClass('was-part-of-last-move');
      to.addClass('was-part-of-last-move');
    },

    startGameOver: function() {
      this.get('boardObject').start();
      this.get('gameObject').reset();
      Ember.$('.engine-data').text('');
      Ember.$('.pgn').empty();
      Ember.$('.square-55d63').removeClass('was-part-of-last-move');
    },

    engineData: function(data) {
      var game = this.get("gameObject");
      var score = data.score;

      if (score) {
        if (game.turn() === 'b' && score[0] !== '#') {
          score = score * -1;
        } else if (game.turn() === 'b' && score[0] === "#") {
          score = score.slice(score.indexOf("-"), 1);
        }
        Ember.$("#score").text(score);
      }

      if (data.bestmove) {
        Ember.$("#bestmove").text(data.bestmove);
      }

      if (data.variation) {
        Ember.$("#variation").text(data.variation);
      }

      if (data.depth) {
        Ember.$("#depth").text(data.depth);
      }
    },

    turnDiagramModeOn: function() {
      Ember.$('canvas').addClass('diagram-mode');
      this.set('diagramMode', true);
    },

    turnDiagramModeOff: function() {
      Ember.$('canvas').removeClass('diagram-mode');
      this.set('diagramMode', false);
    },

    drawForOthers: function(data) {
      var x = data.x;
      var y = data.y;
      var type = data.type;
      var paint = data.paint;
      var context = document.getElementById('diagram').getContext('2d');

      if (type === "mousedown") {
        context.beginPath();
        return context.moveTo(x, y);
      } else if (type === "mousemove") {
        if (paint) {
            context.lineTo(x, y);
        }
        return context.stroke();
      }
    },

    clearDiagram: function() {
      var context = document.getElementById('diagram').getContext('2d');
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    },

    canIhaveYourGameData: function(data) {
      var squares = Ember.$('.was-part-of-last-move');
      var sendSquares = [];
      Ember.$.each(squares, function(key, value) {
        var square = Ember.$(value).attr('data-square');
        console.log(square);
        sendSquares.push(square);
      });
      this.socket.emit('update client', { socketId: data.socketId, gameHistory: this.get('gameObject').history(), analysisOn: this.get('stockfishAnalysis'), squares: sendSquares });
    },

    getUpdated: function(data) {
      var game = this.get('gameObject');
      var board = this.get('boardObject');
      game.load_pgn(data.history.join(' '));
      board.position(game.fen());
      this.get('sendPgnUpdate').send('updateYourPgn');
      Ember.$('.square-' + data.squares[0] + ', .square-' + data.squares[1]).addClass('was-part-of-last-move');
      if (data.analysisOn) {
        this.socket.emit('start analyzing', { fen: game.fen() });
      }

    },

    stockfishOn: function() {
      this.set('stockfishAnalysis', true);
      Ember.$('#analysisSwitch').prop('checked', true);
      this.get('iosSwitch').send('updateSwitchStatus');
    },

    stockfishOff: function() {
      this.set('stockfishAnalysis', false);
      Ember.$('.engine-data').text('');
      Ember.$('#analysisSwitch').prop('checked', false);
      this.get('iosSwitch').send('updateSwitchStatus');
    }
  }
});
