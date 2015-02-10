import Ember from 'ember';
import InboundActions from 'ember-component-inbound-actions/inbound-actions';

export default Ember.Component.extend(InboundActions, {
  tagName: 'div',
  classNames: ['ios-switch-container'],
  status: false,
  actions: {
    updateSwitchStatus: function() {
      this.set('status', Ember.$('#analysisSwitch').is(':checked'));
    },

    turnOnSwitch: function() {
      Ember.$('#analysisSwitch').prop('checked', true);
    },

    turnOffSwitch: function() {
      Ember.$('#analysisSwitch').prop('checked', false);
    }
  },
  didInsertElement: function() {
    var _this = this;
    Ember.$('#analysisSwitch').on('change', function() {
      var data = {};
      data.isChecked = Ember.$(this).is(':checked');
      _this.sendAction('updateIfImChecked', data);
      _this.set('status', data.isChecked);
    });
  }
});
