import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    Ember.$('body').addClass('marketing');
  },
  deactivate: function() {
    Ember.$('body').removeClass('marketing');
  }
});
