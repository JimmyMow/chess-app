import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['video-chat'],
  apiKey: "44827272",
  didInsertElement: function() {
    // var guestCounter = 1;
    var session = OT.initSession(this.get('apiKey'), this.get('sessionId'));

    session.on("streamCreated", function(event) {
      // this.$('.video-chat').prepend("<div id='guestPublisher" + guestCounter + "' class='video-box'></div>");
      session.subscribe(event.stream, "otherPeople", { width: 200, height: 159, insertMode: 'append', style: { buttonDisplayMode: 'off', nameDisplayMode: 'off', bugDisplayMode: 'off' } });
      // guestCounter++;
    }.bind(this));

    session.connect(this.get('token'), function() {
      var publisher = OT.initPublisher("youPublisher", {width: 200, height: 159});
      this.$("#youPublisher").prependTo(".video-chat");
      session.publish(publisher);
    }.bind(this));
  }
});
