import Ember from 'ember';
import InboundActions from 'ember-component-inbound-actions/inbound-actions';

export default Ember.Component.extend(InboundActions, {
  tag: 'div',
  classNames: ['canvas-container'],
  ctx: null,
  didInsertElement: function() {
    var _this = this;
    var boardPos = Ember.$( "#board" ).position();
    Ember.$('#diagram').css('top', boardPos.top - 12);
    Ember.$('#diagram').css('left', boardPos.left);
    var canvas = document.getElementById('diagram');
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "solid";
    ctx.strokeStyle = "#32CD32";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    this.set('ctx', ctx);
    var paint = false;
    function draw(x, y, type) {
        if (type === "mousedown") {
            console.log('here at mousedown');
            ctx.beginPath();
            return ctx.moveTo(x, y);
        } else if (type === "mousemove") {
            console.log('here at mousemove');
            if (paint) {
                ctx.lineTo(x, y);
            }
            return ctx.stroke();
        }
    }
  /*
    Draw Events
  */
    Ember.$('#diagram').on('mousedown mousemove mouseup', function(e) {
        var offset, type, x, y;
        type = e.handleObj.type;
        if (type === 'mousedown') {
            paint = true;
        } else if (type === 'mouseup') {
            paint = false;
        }
        offset = Ember.$('#diagram').offset();
        e.offsetX = e.pageX - offset.left;
        e.offsetY = e.pageY - offset.top;
        x = e.offsetX;
        y = e.offsetY;
        if (paint) {
            draw(x, y, type);
            _this.sendAction('action', { x: x, y: y, type: type, paint: paint });
        }

    });
  }
});
