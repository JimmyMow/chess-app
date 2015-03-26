import Ember from 'ember';

export default Ember.Controller.extend({
  showLoading: false,
  actions: {
    createRoom: function() {
      this.set('showLoading', true);
      var _this = this;
      var room = this.store.createRecord('room', {});
      room.save().then(function(room) {
        if(room) {
          _this.set('showLoading', false);
          _this.transitionToRoute('room.analyze', room.get('id'));
        } else {
          alert('error!');
        }
      });
    }
  },

  sockets: {
    roomConnected: function(data) {
      console.log("Connected to room: ", data.room);
    },

    roomDisconnected: function() {
      console.log("Disconnected from room");
    },

    connect: function() {
      console.log('EmberSockets has connected...');
    },

    disconnect: function() {
      console.log('EmberSockets has disconnected...');
    }
  }
});
