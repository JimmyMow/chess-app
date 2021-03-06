import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';
import LinkView from './overrides/linkview';

Ember.MODEL_FACTORY_INJECTIONS = true;

var Socket = EmberSockets.extend({
  host: window.location.host,
  port: 3000,
  controllers: ['room', 'index', 'user_room'],
  autoConnect: true
});

var App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver: Resolver,
  Socket: Socket
});

Ember.Router.reopen({
  notifyGoogleAnalytics: function() {
    if (!ga) { return; }
    return ga('send', 'pageview', {
        'page': this.get('url'),
        'title': this.get('url')
      });
  }.on('didTransition')
});

loadInitializers(App, config.modulePrefix);

export default App;
