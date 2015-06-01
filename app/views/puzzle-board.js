import Ember from 'ember';

export default Ember.View.extend({
  tagName: 'div',
  classNames: ['puzzle-board', 'chessground', 'wood', 'tiny', 'cburnett', 'coordinates'],
  fen: null,
  gameFen: null,
  ground: null,

  click: function() {
    if (this.get('isEditing') ) {
      return;
    }
    var roomController = this.get('roomController');
    roomController.set('puzzleFenString', this.get('fen'));
    roomController.set('puzzleGameFenString', this.get('gameFen'));
    roomController.get('chessBoardComponent').send('puzzleClickedSetup');
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
