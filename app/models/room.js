import DS from 'ember-data';

var Room = DS.Model.extend({
  sessionId: DS.attr("string"),
  token: DS.attr("string")
});

export default Room;
