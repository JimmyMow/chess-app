import Ember from 'ember';

export default Ember.ObjectController.extend({
  owner: function() {
    return this.get('model.id') === this.get('session.user.id');
  }.property('model', 'session'),
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
            _this.notify.error('Hmmm, there was a problem signing you out', {
              closeAfter: 3000
            });
          }
      });
    }
  }
});
