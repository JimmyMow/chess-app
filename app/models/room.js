import DS from 'ember-data';

var Room = DS.Model.extend({
  sessionId: DS.attr("string"),
  token: DS.attr("string"),
  created_at: DS.attr("string"),
  updated_at: DS.attr("string"),
});

export default Room;
