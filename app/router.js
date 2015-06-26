import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource('home', { path: '/' }, function() {
    this.route('marketing', { path: '/' });
    this.route('login');
    this.route('signup');
    this.route('about');
    this.route('faq');
  });

  this.resource('user', { path: '/:user_id' }, function() {
    this.route('edit');
  });

  this.resource('userroom', { path: '/:user_id/room' }, function() {
    this.route('personalroom', { path: '/' });
  });

  this.resource('room', { path: '/room/:room_id' }, function() {});
  this.route('examples');
});

export default Router;
