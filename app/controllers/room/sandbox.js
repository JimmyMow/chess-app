import Ember from 'ember';

export default Ember.Controller.extend({
  boardObject: null,
  gameObject: null,
  diagramMode: false,
  actions: {
    sendPosition: function(data) {
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
    }
  },

  sockets: {
    changePosition: function(obj) {
      this.get('boardObject').position(obj.fen);
      this.get('gameObject').load_pgn(obj.history.join(" "));
      this.get('sendPgnUpdate').send('updateYourPgn');
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
      alert('Someone joined and wants your game data bro');
      this.socket.emit('update client', { socketId: data.socketId, gameHistory: this.get('gameObject').history() });
    },

    getUpdated: function(data) {
      console.log(data);
      var game = this.get('gameObject');
      var board = this.get('boardObject');
      game.load_pgn(data.history.join(' '));
      board.position(game.fen());
      this.get('sendPgnUpdate').send('updateYourPgn');
      this.socket.emit('start analyzing', { fen: game.fen() });
    }
  }
});
