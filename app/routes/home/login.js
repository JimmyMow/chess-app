import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    Ember.$('body').addClass('login-body');
  },
  deactivate: function() {
    Ember.$('body').removeClass('login-body');
  },
  beforeModel: function() {
    this.store.unloadAll('user');
  }
});
