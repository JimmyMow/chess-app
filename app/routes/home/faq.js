import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    Ember.$('body').addClass('faq');
  },
  deactivate: function() {
    Ember.$('body').removeClass('faq');
  }
});
