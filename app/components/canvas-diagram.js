import Ember from 'ember';
import InboundActions from 'ember-component-inbound-actions/inbound-actions';

export default Ember.Component.extend(InboundActions, {
  tag: 'div',
  classNames: ['canvas-container'],
  ctx: null,
  orientation: 'white',
  color: '#32CD32',
  actions: {
    removeActive: function() {
      Ember.$('.colors').removeClass('active');
    },

    flipOrientation: function() {
      var orientation = this.get('orientation') === 'white' ? 'black' : 'white';
      this.set('orientation', orientation);
    }
  },
  didInsertElement: function() {
    var _this = this;
    Ember.$('.diagram-mode-container').on('click', '.colors', function(e) {
       _this.send('removeActive');
       Ember.$(this).addClass('active');
       _this.set('color', Ember.$(this).attr('data-hex'));
       ctx.strokeStyle = Ember.$(this).attr('data-hex');
       e.preventDefault();
    });

    var boardPos = Ember.$( "#board" ).position();
    Ember.$('#diagram').css('top', boardPos.top);
    Ember.$('#diagram').css('left', boardPos.left);
    var canvas = document.getElementById('diagram');
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "solid";
    ctx.strokeStyle = this.get('color');
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    this.set('ctx', ctx);
    var paint = false;
    function draw(x, y, type, orientation) {
        if(orientation === 'black') {
          x = Ember.$('#diagram').height() - x;
          y = Ember.$('#diagram').width() - y;
        }
        if (type === "mousedown") {
            ctx.beginPath();
            return ctx.moveTo(x, y);
        } else if (type === "mousemove") {
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
        offset.right = offset.left + Ember.$('#diagram').width();
        offset.bottom = offset.top + Ember.$('#diagram').height();

        e.offsetX = e.pageX - offset.left;
        e.offsetY = e.pageY - offset.top;
        x = e.offsetX;
        y = e.offsetY;

        if (paint) {
            draw(x, y, type, _this.get('orientation'));
            _this.sendAction('action', { x: x, y: y, type: type, paint: paint, orientation: _this.get('orientation') });
        }
    });
    window.ctx = this.get('ctx');
  }
});
