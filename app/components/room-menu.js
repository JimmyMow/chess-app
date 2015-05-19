import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    hamclicked: function() {
      Ember.$('.lines-button').toggleClass('close');
      Ember.$('#ham-plate').toggleClass('close');
      Ember.$('.room-menu').toggleClass('active');
    }
  }
});
