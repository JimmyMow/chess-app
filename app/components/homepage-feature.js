import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'li',
  classNames: 'feature',
  classNameBindings: ['active'],
  active: false,
  mousedOn: false,
  mouseEnter: function() {
    Ember.$('.feature').removeClass('active');
    this.$().addClass('active');
    Ember.$('#infobox').text(this.get('message'));

    clearInterval(window.interval);
    this.set('mousedOn', true);
  },

  mouseLeave: function() {
    this.set('mousedOn', false);
    this.get('start')();
  },

  start: function() {
    var active = Ember.$('.active');
    var next = active.next().length > 0 ? active.next() :  Ember.$("ul#features li:eq(0)");

    var interval = setInterval(function() {
      Ember.$('.feature').removeClass('active');
      next.addClass('active');

      var p = next.find('.hide');
      Ember.$('#infobox').text(p.text());

      active = next;
      next = active.next().length > 0 ? active.next() :  Ember.$("ul#features li:eq(0)");

    }, 7000);

    window.interval = interval;
  },

  didInsertElement: function() {
    if (this.$().hasClass('active')) {
      this.get('start')();
    }
  }
});
