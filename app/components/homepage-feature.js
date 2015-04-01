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
    var el = "<p class='infobox' id='infobox'>" + this.get('message') + "</p>";
    Ember.$("#infobox").remove();
    Ember.$(el).hide().appendTo("#infoContainer").fadeIn(1000);

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
      var el = "<p class='infobox' id='infobox'>" + p.text() + "</p>";
      Ember.$("#infobox").remove();
      Ember.$(el).hide().appendTo("#infoContainer").fadeIn(1000);

      active = next;
      next = active.next().length > 0 ? active.next() :  Ember.$("ul#features li:eq(0)");

    }, 9000);

    window.interval = interval;
  },

  didInsertElement: function() {
    if (this.$().hasClass('active')) {
      this.get('start')();
    }
  }
});
