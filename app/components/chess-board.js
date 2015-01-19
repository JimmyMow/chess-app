import Ember from 'ember';

export default Ember.Component.extend({
  tag: 'div',
  classNames: ['chess-board'],
  // controller: this.get('parentController'),
  board: null,
  onChange: function(oldPos, newPos) {
    var oldPosition = ChessBoard.objToFen(oldPos);
    var newPosition = ChessBoard.objToFen(newPos);
    console.log("Position changed:");
    console.log("Old position: " + oldPosition);
    console.log("New position: " + newPosition);
    console.log("--------------------");
    this.sendPosition(newPosition);
  },
  didInsertElement: function() {
    var _this = this;
    var newBoard = new ChessBoard('board', {
      sparePieces: true,
      draggable: true,
      position: 'start',
      onChange: this.get('onChange'),
      sendPosition: function(pos) {
        _this.sendAction('action', pos);
      }
    });
    Ember.$(window).resize(newBoard.resize);
    this.set('board', newBoard);
  }
});
