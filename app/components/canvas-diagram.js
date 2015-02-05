import Ember from 'ember';

export default Ember.Component.extend({
  tag: 'div',
  classNames: ['canvas-container'],
  didInsertElement: function() {
    var boardPos = Ember.$( "#board" ).position();
    Ember.$("#diagram").css('top', boardPos.top - 12);
    Ember.$("#diagram").css('left', boardPos.left);
    var context = document.getElementById('diagram').getContext("2d");
    var canvas = document.getElementById('diagram');
    context = canvas.getContext("2d");
    context.strokeStyle = "#ff0000";
    context.lineJoin = "bevel";
    context.lineWidth = 3;

    var clickX = [];
    var clickY = [];
    var clickDrag = [];
    var paint;

    /**
     * Add information where the user clicked at.
     * @param {number} x
     * @param {number} y
     * @return {boolean} dragging
     */
    function addClick(x, y, dragging) {
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
    }
    /**
     * Draw the newly added point.
     * @return {void}
     */
    function drawNew() {
        var i = clickX.length - 1;
        if (!clickDrag[i]) {
            if (clickX.length === 0) {
                context.beginPath();
                context.moveTo(clickX[i], clickY[i]);
                context.stroke();
            } else {
                context.closePath();

                context.beginPath();
                context.moveTo(clickX[i], clickY[i]);
                context.stroke();
            }
        } else {
            context.lineTo(clickX[i], clickY[i]);
            context.stroke();
        }
    }

    function mouseDownEventHandler(e) {
        paint = true;
        var x = e.pageX - canvas.offsetLeft;
        var y = e.pageY - canvas.offsetTop;
        if (paint) {
            addClick(x, y, false);
            drawNew();
        }
    }

    function touchstartEventHandler(e) {
        paint = true;
        if (paint) {
            addClick(e.touches[0].pageX - canvas.offsetLeft, e.touches[0].pageY - canvas.offsetTop, false);
            drawNew();
        }
    }

    function mouseUpEventHandler() {
        context.closePath();
        paint = false;
    }

    function mouseMoveEventHandler(e) {
        var x = e.pageX - canvas.offsetLeft;
        var y = e.pageY - canvas.offsetTop;
        if (paint) {
            addClick(x, y, true);
            drawNew();
        }
    }

    function touchMoveEventHandler(e) {
        if (paint) {
            addClick(e.touches[0].pageX - canvas.offsetLeft, e.touches[0].pageY - canvas.offsetTop, true);
            drawNew();
        }
    }

    function setUpHandler(isMouseandNotTouch, detectEvent) {
        removeRaceHandlers();
        if (isMouseandNotTouch) {
            canvas.addEventListener('mouseup', mouseUpEventHandler);
            canvas.addEventListener('mousemove', mouseMoveEventHandler);
            canvas.addEventListener('mousedown', mouseDownEventHandler);
            mouseDownEventHandler(detectEvent);
        } else {
            canvas.addEventListener('touchstart', touchstartEventHandler);
            canvas.addEventListener('touchmove', touchMoveEventHandler);
            canvas.addEventListener('touchend', mouseUpEventHandler);
            touchstartEventHandler(detectEvent);
        }
    }

    function mouseWins(e) {
        setUpHandler(true, e);
    }

    function touchWins(e) {
        setUpHandler(false, e);
    }

    function removeRaceHandlers() {
        canvas.removeEventListener('mousedown', mouseWins);
        canvas.removeEventListener('touchstart', touchWins);
    }

    canvas.addEventListener('mousedown', mouseWins);
    canvas.addEventListener('touchstart', touchWins);
  }
});
