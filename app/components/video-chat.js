import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['video-chat'],
  apiKey: "44827272",
  didInsertElement: function() {
    var guestCounter = 1;
    var session = OT.initSession(this.get('apiKey'), this.get('sessionId'));

    session.on("streamCreated", function(event) {
      Ember.$('.video-chat').prepend("<div id='guestPublisher" + guestCounter + "' class='video-box'></div>");
      session.subscribe(event.stream, "guestPublisher" + guestCounter, {width: 200, height: 159});
      guestCounter++;
    });

    session.connect(this.get('token'), function() {
      var publisher = OT.initPublisher("youPublisher", {width: 200, height: 159});
      Ember.$("#youPublisher").prependTo(".video-chat");
      session.publish(publisher);
    });
  }
});
