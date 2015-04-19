import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    Ember.$('body').addClass('eee-container');

    var $allVideos = $("iframe[src^='//www.youtube.com']"),
    $fluidEl = $("figure");

    $allVideos.each(function() {
      $(this)
        // jQuery .data does not work on object/embed elements
        .attr('data-aspectRatio', this.height / this.width)
        .removeAttr('height')
        .removeAttr('width');
    });

    $(window).resize(function() {
      var newWidth = $fluidEl.width();
        $allVideos.each(function() {
        var $el = $(this);
        $el.width(newWidth).height(newWidth * $el.attr('data-aspectRatio'));

      });

    }).resize();
  },
  deactivate: function() {
    Ember.$('body').removeClass('eee-container');
  }
});
