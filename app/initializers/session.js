import Ember from 'ember';

export default {
  name: 'session',

  initialize:  function(container, application){
    var Session = Ember.Object.extend({
      user: null,

      isAuthenticated: function(){
        return this.get('user') !== null;
      }.property('user')
    });

    application.register('session:main', Session);
    application.inject('route', 'session', 'session:main');
    application.inject('controller', 'session', 'session:main');
  }
};
