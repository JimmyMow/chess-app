import DS from 'ember-data';

var User = DS.Model.extend({
  email: DS.attr("string"),
  password: DS.attr("string"),
  sessionId: DS.attr("string"),
  token: DS.attr("string"),
  roomsecret: DS.attr("string"),
  about: DS.attr("string"),
  rating: DS.attr("string"),
  location: DS.attr("string"),
  name: DS.attr("string"),
  created_at: DS.attr("string"),
  updated_at: DS.attr("string"),
  puzzles: DS.hasMany('puzzle', {async: true}),
  games: DS.hasMany('game', {async: true})
});

export default User;
