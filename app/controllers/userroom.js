import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ['room'],
  isFetchingPuzzles: false,
  isFetchingGames: false,
  roomController: Ember.computed.alias('controllers.room'),
  owner: function() {
    return this.get('model.id') === this.get('session.user.id');
  }.property('model', 'session'),
  sandboxModeOnAndUser: function() {
    return this.get('controllers.room.sandboxMode') && this.get('owner');
  }.property('controllers.room.sandboxMode', 'owner'),
  thereArePuzzles: function() {
    return this.get('model.puzzles.length') > 0;
  }.property('model.puzzles.length'),

  actions: {
    createPuzzle: function() {
      var _this = this;
      var board = this.get('controllers.room.boardObject');
      var fenObject = this.get('controllers.room.fenDataObject');
      var fen = this.get('computeFen')(_this, fenObject, board.getFen());

      var puzzle = this.store.createRecord('puzzle', {
        name: _this.get('name'),
        user: _this.get("session.user"),
        position: board.getFen(),
        gameFen: fen
      });

      puzzle.get('user').then(function() {
        puzzle.save().then(function(puzzle) {
          _this.notify.success("\"" + puzzle.get('name') +  "\"" + " is now saved for you to reuse!", {
            closeAfter: 5000
          });
          _this.set('name', '');
          _this.get('model.puzzles').pushObject(puzzle);
        }, function() {
          _this.notify.error("Shoot, we had a problem saving your puzzle", {
            closeAfter: 3000
          });
        });
      });
    },

    fetchMorePuzzles: function() {
      var _this = this;
      this.set('isFetchingPuzzles', true);
      this.store.find('puzzle', { user : this.get('model.id'), skip : this.get('model.puzzles.length') }).then(function(puzzlesArr) {
        _this.set('isFetchingPuzzles', false);
        _this.get('model.puzzles').then(function(puzzles) {
          puzzles.pushObjects(puzzlesArr.content);
        });
      }, function() {
        _this.set('isFetchingPuzzles', false);
        _this.notify.error("Shoot, we had a problem getting some more puzzles for ya", {
          closeAfter: 3000
        });
      });
    },
    fetchMoreGames: function() {
      var _this = this;
      this.set('isFetchingGames', true);
      this.store.find('game', { user : this.get('model.id'), skip : this.get('model.games.length') }).then(function(gamesArr) {
        _this.set('isFetchingGames', false);
        _this.get('model.games').then(function(games) {
          games.pushObjects(gamesArr.content);
        });
      }, function() {
        _this.set('isFetchingGames', false);
        _this.notify.error("Shoot, we had a problem getting some more puzzles for ya", {
          closeAfter: 3000
        });
      });
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
  }
});
