import Ember from 'ember';
import Notify from 'ember-notify';

export default Ember.Component.extend({
  classNames: ['game-container'],
  actions: {
    delete: function() {
      if (confirm("Are you sure you want to delete this game?") == true) {
        this.get('game').destroyRecord();
      } else {
        return;
      }
    }
  }
});
