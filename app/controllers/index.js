import Ember from 'ember';

export default Ember.Controller.extend({
  screenshotData: [{ url: window.location.href + '/assets/images/marketing/screen_shot_one.png', dataSize: '1997x1024', before: false, after: false, content: null }],
  whyLearnChessData: [
    { url: window.location.href + '/assets/images/marketing/how_chess_helps.png', dataSize: '1750x1024', before: false, after: true, content: "Not only is chess fun, but many studies have shown it improves the mind, link a lot. So why doesn't everyone actively play chess and improve themselves while having fun? Well chess is not an easy game, and use to be very hard to learn and study. That has changed. All it takes now is sessions on our platform from your own computer to have access to the whole chess world!" },
    { url: window.location.href + '/assets/images/marketing/chess_in_schools.png', dataSize: '1404x1024', before: true, after: false, content: "Chess is also amazing for the young and has been proven to help students in school. As different technologies come and go and debates continue about what is good for kids, there has been one game that has been proven to be great for years: chess. Now, it's more accessible than ever." }
  ],
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
