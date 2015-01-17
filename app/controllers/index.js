import Ember from 'ember';

export default Ember.Controller.extend({
  boardObject: null,
  actions: {
    sendPosition: function(pos) {
      this.socket.emit('sendPosition', {pos: pos});
    },

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
    changePosition: function(obj) {
      console.log(obj);
      var board = this.get('boardObject');
      board.position(obj.pos);
    },

    connect: function() {
      console.log('EmberSockets has connected...');
    },

    disconnect: function() {
      console.log('EmberSockets has disconnected...');
    }
  }
});
