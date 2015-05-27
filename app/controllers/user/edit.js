import Ember from 'ember';

export default Ember.ObjectController.extend({
  editing: false,
  owner: function() {
    return this.get('model.id') === this.get('session.user.id');
  }.property('model', 'session'),
  actions: {
    editUser: function() {
      var _this = this;
      if(this.get('session.isAuthenticated') && this.get('session.user.id') === this.get('content.id')) {
        var user = this.get('content');
        user.save().then(function(user) {
          _this.notify.success('Successfully updated your profile', {
              closeAfter: 3000
          });
          _this.transitionToRoute('user');
        }, function() {
          _this.notify.error('Shoot, I had a problem updating your profile', {
              closeAfter: 3000
          });
        });
      }
    }
  }
});
