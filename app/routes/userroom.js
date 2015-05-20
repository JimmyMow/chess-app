import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    if (this.store.hasRecordForId("user", params.user_id)) {
      return this.store.getById("user", params.user_id).reload();
    } else {
      return this.store.find("user", params.user_id);
    }
    // return this.store.fetchById("user", params.user_id);
  },
  afterModel: function(model, transition) {
    model.reload();
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
