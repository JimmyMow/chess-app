import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    if( this.get('session.isAuthenticated') ) {
      this.transitionTo('user', this.get('session.user'));
    }
  },
  setupController: function(controller, model) {
    controller.set('model', model);
    this.socket.emit('leave room');
  }
});
