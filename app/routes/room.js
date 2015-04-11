import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    Ember.$('body').addClass('eee-container');
    this.notify.success('You have successfully created your own chess room! To invite others, share the url in the top of your browser or click the link in the top left of your screen.', {
      closeAfter: null
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
