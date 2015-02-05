import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    createRoom: function() {
      var _this = this;
      var room = this.store.createRecord('room', {});
      room.save().then(function(room) {
        if(room) {
          console.log(room.get('id'));
          _this.transitionToRoute('room.sandbox', room.get('id'));
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
      console.log("Disconnected from room: ");
    },

    connect: function() {
      console.log('EmberSockets has connected...');
    },

    disconnect: function() {
      console.log('EmberSockets has disconnected...');
    }
  }
});
