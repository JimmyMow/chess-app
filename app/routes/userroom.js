import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return this.store.find("user", params.user_id);
  },
  afterModel: function(model, transition) {
    var passphrase = prompt("Please enter the room secret for this room:");
    if (passphrase !== model.get('roomsecret')) {
      alert('Sorry, wrong room secret. We can not let you in to this room');
      if ( this.get('session.isAuthenticated') ) {
        this.transitionTo('user', model);
      } else {
        this.transitionTo('home.marketing');
      }
    }
  }
});
