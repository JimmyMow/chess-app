import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    this.store.unloadAll('user');
  }
});
