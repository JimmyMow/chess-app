import Ember from 'ember';

export default Ember.View.extend({
  tagName: 'div',
  classNames: ['puzzle-board', 'chessground', 'wood', 'tiny', 'cburnett', 'coordinates'],
  fen: null,
  ground: null,

  click: function() {
    var roomController = this.get('roomController');
    roomController.send('pgnConverter', this.get('game.pgn'));
    Ember.$('.room-menu').removeClass('active');
    Ember.$('.arrow').removeClass('close');
    Ember.$('#ham-plate').removeClass('close');
  },

  didInsertElement: function() {
    var ground = new Chessground(document.getElementById(this.get('elementId')), {
      fen: this.get('fen'),
      coordinates: false,
      movable: {
        free: false
      }
    });
    this.set('ground', ground);
  }
});
