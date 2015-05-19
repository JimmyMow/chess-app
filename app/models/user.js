import DS from 'ember-data';

var User = DS.Model.extend({
  email: DS.attr("string"),
  password: DS.attr("string"),
  sessionId: DS.attr("string"),
  token: DS.attr("string"),
  roomsecret: DS.attr("string"),
  puzzles: DS.hasMany('puzzle', {async: true})
});

export default User;
