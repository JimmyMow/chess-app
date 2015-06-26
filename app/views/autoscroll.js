import Ember from 'ember';

export default Ember.View.extend({
  tagName: 'a',
  attributeBindings: ['customHref:href'],
  initialize: function () {
    this.set('template', Ember.Handlebars.compile(this.get('msg')));
  }.on('init'),
  click: function(event) {
    var hash = event.target.hash;
    var el = Ember.$("a[name=" + hash.slice(1) +"]");
    Ember.$('html,body').animate({
      scrollTop: el.offset().top
    }, 1000);
    return false;
  }
});
