export default Ember.Controller.extend({
  isCreating: false,
  erros: null,
  actions: {
    createUser: function() {
      this.set('isCreating', true);
      var self = this;
      var data = this.getProperties("username", "email", "password");
      var user = this.store.createRecord('user', {
        id: data.username.toLowerCase(),
        email: data.email,
        password: Ember.$.md5(data.password)
      });

      user.save().then(function(user) {
        self.set('session.user', user);
        self.transitionToRoute('user', user);
        self.set('isCreating', false);
        self.set('username', '');
        self.set('email', '');
        self.set('password', '');
      }, function(errorObj) {
        self.set('isCreating', false);
        Ember.$('.message').text(errorObj.responseJSON.errors.message);
        self.set('password', '');
      });
    }
  }
});
