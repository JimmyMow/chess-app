import Ember from 'ember';

export default Ember.LinkView.reopen({
  attributeBindings: ['data-hint']
});
