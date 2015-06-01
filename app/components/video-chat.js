import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['video-chat'],
  apiKey: "44827272",
  session: null,
  didInsertElement: function() {
    var session = OT.initSession(this.get('apiKey'), this.get('sessionId'));
    this.set('session', session);
    if ( session.isConnected() ) {
      session.disconnect();
    }

    session.on("streamCreated", function(event) {
      session.subscribe(event.stream, "otherPeople", { width: 200, height: 159, insertMode: 'append', style: { buttonDisplayMode: 'off', nameDisplayMode: 'off', bugDisplayMode: 'off' } });
    }.bind(this));

    session.connect(this.get('token'), function() {
      var publisher = OT.initPublisher("youPublisher", {width: 200, height: 159});
      this.$("#youPublisher").prependTo(".video-chat");
      session.publish(publisher);
    }.bind(this));
  },
  willDestroyElement: function() {
    var session = this.get('session');
    session.disconnect();
  }
});
