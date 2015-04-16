import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource('room', { path: '/:room_id' }, function() {
    this.route('analyze');
  });
});

export default Router;
