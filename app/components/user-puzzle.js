import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['puzzle-container'],
  isEditing: false,
  name: null,
  fen: null,
  gameFen: null,
  board: null,
  fenData: {
    toPlay: null,
    whiteKingCastles: '-',
    whiteQueenCastles: '-',
    blackKingCastles: '-',
    blackQueenCastles: '-',
  },
  whiteToPlay: function() {
    return this.get('fenData').toPlay === 'w'
  }.property('fenData'),
  actions: {
    edit: function() {
      var controller = this.get('targetObject');
      var _this = this;
      this.toggleProperty('isEditing');
      if (this.get('isEditing')) {
        this.get('board').set({
          movable: {
            free: true
          }
        });
      } else {
        this.get('board').set({
          movable: {
            free: false
          }
        });
      }
    },
    parseFen: function() {
      var fen = this.get('gameFen');
      var fenData = this.get('fenData');

      var tokens = fen.split(/\s+/);
      fenData.toPlay = tokens[1];

      if (tokens[2].indexOf('K') > -1) {
        fenData.whiteKingCastles = 'K';
      }
      if (tokens[2].indexOf('Q') > -1) {
        fenData.whiteQueenCastles = 'Q';
      }
      if (tokens[2].indexOf('k') > -1) {
        fenData.blackKingCastles = 'k';
      }
      if (tokens[2].indexOf('q') > -1) {
        fenData.blackQueenCastles = 'q';
      }
    }
  },
  didInsertElement: function() {
    this.set('name', this.get('puzzle.name'));
    this.set('fen', this.get('puzzle.fen'));
    this.set('gameFen', this.get('puzzle.gameFen'));

    this.send('parseFen');
  }
});
