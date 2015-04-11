import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['room/analyze'],
  linkUrl: window.location.href,
  sandboxMode: false,
  actions: {
    sandboxMode: function() {
      var analyzeController = this.get('controllers.room/analyze');
      analyzeController.send('sandboxMode');
      this.toggleProperty('sandboxMode');
    }
  }
});
