import Ember from 'ember';
import Notify from 'ember-notify';

export default Ember.Component.extend({
  tagName: 'nav',
  classNames: ['room-nav'],

  actions: {
    signOut: function() {
      var controller = this.get('targetObject');
      Ember.$.ajax({
        url: '/api/logout',
        type: 'POST'
      }).then(function(response) {
        if(response){
          controller.set('session.user', null);
          controller.transitionToRoute('home.marketing');
          controller.store.unloadAll('user');
          controller.store.unloadAll('puzzle');
        } else {
          Notify.error('Hmmm, there was a problem signing you out', {
            closeAfter: 3000
          });
        }
      });
    }
  }
});
