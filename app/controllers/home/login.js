export default Ember.Controller.extend({
  isLoggingIn: false,
  actions: {
    login: function() {
      var self = this;
      var data = this.getProperties("username", "password");
      var user = this.store.createRecord('user', {
        id: data.username.toLowerCase(),
        password: Ember.$.md5(data.password),
        operation: 'login'
      });

      user.save().then(function(user) {
        Ember.$('.login').removeClass('error');
        self.set('session.user', user);
        self.transitionToRoute('user', user);
        self.set('username', '');
        self.set('password', '');
      }, function() {
        Ember.$('.login').addClass('error');
        self.set('password', '');
        self.store.unloadAll('user');
      });
    }
  }});
