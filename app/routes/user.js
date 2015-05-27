import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    Ember.$('body').addClass('eee-container');
  },
  deactivate: function() {
    Ember.$('body').removeClass('eee-container');
  }
});
