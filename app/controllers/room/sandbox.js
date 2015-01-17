import Ember from 'ember';

export default Ember.Controller.extend({
  boardObject: null,
  actions: {
    sendPosition: function(pos) {
      this.socket.emit('sendPosition', {pos: pos});
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
