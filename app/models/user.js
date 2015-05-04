import DS from 'ember-data';

var Room = DS.Model.extend({
  email: DS.attr("string"),
  password: DS.attr("string"),
  sessionId: DS.attr("string"),
  token: DS.attr("string")
});

export default Room;
