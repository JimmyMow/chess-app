import Ember from 'ember';

export default Ember.ObjectController.extend({
  actions: {
    signOut: function() {
      var self = this;
      Ember.$.ajax({
       url: '/api/logout',
       type: 'POST'
      }).then(function(response) {
          if(response){
            self.set('session.user', null);
            self.transitionToRoute('home.marketing');
            self.store.unloadAll('user');
          } else {
            alert("There was an error signing you out");
          }
      });
    }
  }
});
