import DS from 'ember-data';

var Game = DS.Model.extend({
  pgn: DS.attr("string"),
  fen: DS.attr("string"),
  white: DS.attr("string"),
  black: DS.attr("string"),
  white_elo: DS.attr("string"),
  black_elo: DS.attr("string"),
  result: DS.attr("string"),
  user: DS.belongsTo("user", {async: true})
});

export default Game;
