import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    Ember.$('body').addClass('signup-body');
  },
  deactivate: function() {
    Ember.$('body').removeClass('signup-body');
  }
});
