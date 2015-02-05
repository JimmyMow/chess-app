import Ember from 'ember';

export default Ember.Controller.extend({
  boardObject: null,
  gameObject: null,
  diagramMode: false,
  actions: {
    sendPosition: function(data) {
      console.log(data);
      this.socket.emit('sendPosition', data);
      Ember.$('.fen').val(data.fen);
    },

    start: function() {
      this.get('boardObject').start();
      this.socket.emit('startingGameOver');
      Ember.$('.engine-data').text('');
    },

    canvas: function() {
      if (this.get('diagramMode')) {
        Ember.$('canvas').removeClass('diagram-mode');
        this.set('diagramMode', false);
      } else {
        Ember.$('canvas').addClass('diagram-mode');
        this.set('diagramMode', true);
      }
    },

    clearCanvas: function() {
      var context = document.getElementById('diagram').getContext('2d');
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    }
  },

  sockets: {
    changePosition: function(obj) {
      this.get('boardObject').position(obj.fen);
      Ember.$('.fen').val(obj.fen);
    },

    startGameOver: function() {
      this.get('boardObject').start();
      Ember.$('.engine-data').text('');
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
    }
  }
});
