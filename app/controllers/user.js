import Ember from 'ember';

export default Ember.ObjectController.extend({
  editingSecret: false,
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
            alert("There was an error signing you out");
          }
      });
    },
    editRoomSecret: function() {
      var _this = this;
      if(this.get('editingSecret')) {
        if(this.get('session.isAuthenticated') && this.get('session.user.id') === this.get('content.id')) {
          var user = this.get('content');
          user.save().then(function(user) {
            _this.notify.success('Successfully saved your room secret', {
                closeAfter: 3000 // or set to null to disable auto-hiding
            });
          });
        }
      }
      this.toggleProperty('editingSecret');
    }
  }
});
