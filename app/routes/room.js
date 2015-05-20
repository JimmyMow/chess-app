import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    Ember.$('body').addClass('eee-container');
    this.notify.success('Welcome to your own chess room! All you have to do now is invite others to review chess with you. To invite others, share the url in the top of your browser or click the link in the top left of your screen.', {
      closeAfter: 10000
    });
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
