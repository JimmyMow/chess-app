import Ember from 'ember';
import Notify from 'ember-notify';

export default Ember.Component.extend({
  classNames: ['puzzle-container'],
  isEditing: false,
  name: null,
  fen: null,
  gameFen: null,
  board: null,
  turn: null,
  fenData: {
    toPlay: null,
    whiteKingCastles: '-',
    whiteQueenCastles: '-',
    blackKingCastles: '-',
    blackQueenCastles: '-'
  },
  whiteToPlay: function() {
    return this.get('turn') === 'w';
  }.property('turn'),
  actions: {
    delete: function() {
      if (confirm("Are you sure you want to delete this position?") == true) {
        this.get('puzzle').destroyRecord();
      } else {
        return;
      }
    },
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
        var name = this.get('puzzle.name');
        var fen = this.get('board').getFen();
        var gamePos = this.get('computeFen')(this, this.get('fenData'), fen);
        this.set('puzzle.name', name);
        this.set('puzzle.position', fen);
        this.set('puzzle.gameFen', gamePos);
        var data = {
          "position": fen,
          "gameFen": gamePos,
          "name": name
        };
        Ember.$.ajax({
          url: '/api/puzzles/' + this.get('puzzle.id'),
          contentType: 'application/json',
          data: JSON.stringify({ puzzle: data }),
          dataType: "json",
          type: 'PUT'
        }).then(function(response) {
          if(response) {
            Notify.success({
              raw: "<div>Successfully updated your puzzle</div>",
              closeAfter: 3000
            });
          } else {
            Notify.error({
              raw: "<div>Shoot, there was a problem editing your puzzle</div>",
              closeAfter: 3000
            });
          }
        });
      }
    },
    parseFen: function() {
      var fen = this.get('gameFen');
      var fenData = this.get('fenData');

      var tokens = fen.split(/\s+/);
      fenData.toPlay = tokens[1];
      this.set('turn', tokens[1]);

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
  computeFen: function(component, fenData, fen) {
    var finalCastleData = component.get('computeFenCastles')(fenData);
    var res = fen + ' ' + fenData.toPlay + ' ' + finalCastleData + ' - 0 1';
    return res;
  },
  computeFenCastles: function(data) {
    var castles = '';
    Object.keys(data).forEach(function(piece) {
      if (piece !== 'toPlay' && data[piece]) {
        castles += data[piece];
      }
    });
    return castles.length ? castles : '-';
  },
  didInsertElement: function() {
    var _this = this;
    this.set('name', this.get('puzzle.name'));
    this.set('fen', this.get('puzzle.position'));
    this.set('gameFen', this.get('puzzle.gameFen'));

    this.send('parseFen');

    Ember.$('#' + this.get('elementId')).on('change', '.puzzle-color', function() {
      var val = Ember.$(this).val();
      _this.get('fenData').toPlay = val;
      _this.set('turn', val);
    });
  }
});
