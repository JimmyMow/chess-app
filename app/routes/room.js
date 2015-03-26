import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    Ember.$('body').addClass('eee-container');
  },
  deactivate: function() {
    Ember.$('body').removeClass('eee-container');
  },
  model: function(params) {
    return this.store.find("room", params.room_id);
  },
  setupController: function(controller, model) {
    controller.set('model', model);
    this.socket.emit('join room', { room: model.id });
  }
});
