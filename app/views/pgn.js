import Ember from 'ember';

export default Ember.View.extend({
  tagName: 'div',
  classNames: ['pgn'],

  didInsertElement: function() {
    this.get('controller').send('updatePgnView');
  }
});
