import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['video-chat'],
  apiKey: "44827272",
  session: null,
  counter: 1,
  resizeVideos: function(component) {
    switch(this.get('counter')) {
      case 1:
        break;
      case 2:
        var videos = document.getElementsByClassName("OT_subscriber");
        for(var i = 0; i < videos.length; i++) {
          var video = videos[i];
          video.style.width = "100%";
          video.style.height = "205px";
        }
        break;
      default:
        var videos = document.getElementsByClassName("OT_subscriber");
        for(var i = 0; i < videos.length; i++) {
          var video = videos[i];
          video.style.width = "49%";
          video.style.height = "102px";
        }

    }
  }.observes('counter'),
  didInsertElement: function() {
    var session = OT.initSession(this.get('apiKey'), this.get('sessionId'));
    this.set('session', session);
    if ( session.isConnected() ) {
      session.disconnect();
    }

    session.on("streamCreated", function(event) {
      session.subscribe(event.stream, "otherPeople", { width: '100%', height: '100%', insertMode: 'append', style: { buttonDisplayMode: 'off', nameDisplayMode: 'off', bugDisplayMode: 'off' } });
      this.set('counter', this.get('counter') + 1);
    }.bind(this));

    session.on("streamDestroyed", function(event) {
      this.set('counter', this.get('counter') - 1);
    }.bind(this));

    session.connect(this.get('token'), function() {
      var publisher = OT.initPublisher("youPublisher", {width: '100%', height: '100%'});
      this.$("#youPublisher").prependTo(".video-chat");
      session.publish(publisher);
    }.bind(this));
  },
  willDestroyElement: function() {
    var session = this.get('session');
    session.disconnect();
  }
});
