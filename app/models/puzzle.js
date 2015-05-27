import DS from 'ember-data';

var Puzzle = DS.Model.extend({
  name: DS.attr("string"),
  user: DS.attr("string"),
  position: DS.attr("string"),
  gameFen: DS.attr("string"),
  created_at: DS.attr("string"),
  updated_at: DS.attr("string"),
  user: DS.belongsTo("user", {async: true})
});

export default Puzzle;
