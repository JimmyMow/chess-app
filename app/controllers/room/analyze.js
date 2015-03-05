import Ember from 'ember';

export default Ember.Controller.extend({
  boardObject: null,
  gameObject: null,
  dataObject: {
    tree: [],
    pathDefault: [{ ply: 0, variation: null }],
    path: [{ ply: 0, variation: null }],
    pathStr: ''
  },
  ctxObject: null,
  diagramMode: false,
  stockfishAnalysis: false,
  orientation: 'white',
  actions: {
    sendPosition: function(data) {
      data.stockfish = this.get('stockfishAnalysis');
      this.socket.emit('sendPosition', data);
    },

    sendDiagram: function(data) {
      this.socket.emit('send diagram', data);
    },

    startOver: function() {
      this.get('chessBoardComponent').send('resetBoardAndGame');
      this.get('chessBoardComponent').send('resetData');
      this.get('chessBoardComponent').send('resetBoardStyles');
      Ember.$('.engine-data').text('');
      this.socket.emit('startingGameOver');
    },

    start: function() {
      this.socket.emit('startPos');
    },

    undo: function() {
      this.get('chessBoardComponent').send('undoMove');
      // this.get('chessBoardComponent').send('updateYourPgn');
      // this.socket.emit('undo move');
    },

    flip: function(){
      var board = this.get('boardObject');
      board.toggleOrientation();
      this.set('orientation', board.getOrientation());
      this.get('canvasDiagram').send('flipOrientation');

      Ember.$('#diagram').toggleClass('flipTest');
    },

    canvas: function() {
      if (this.get('diagramMode')) {
        Ember.$('canvas').removeClass('diagram-mode');
        this.set('diagramMode', false);
        this.socket.emit('turn off diagram mode');
      } else {
        Ember.$('canvas').addClass('diagram-mode');
        this.set('diagramMode', true);
        this.socket.emit('turn on diagram mode');
      }
    },

    clearCanvas: function() {
      var context = document.getElementById('diagram').getContext('2d');
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      this.socket.emit('clear diagram');
    },

    updateIosSwitchCheckedStatus: function(data) {
      var game = this.get('gameObject');
      if (data.isChecked) {
        this.set('stockfishAnalysis', true);
        this.socket.emit('start analyzing', { fen: game.fen() });
      } else {
        this.set('stockfishAnalysis', false);
        this.socket.emit('stop analyzing');
      }
    }
  },

  sockets: {
    changePosition: function(obj) {
      this.get('boardObject').set({
        fen: obj.boardFen,
        lastMove: [obj.from, obj.to]
      });
      this.get('gameObject').load(obj.gameFen);
      this.set('dataObject', obj.data);

      this.get('chessBoardComponent').send('setData');
      this.get('chessBoardComponent').send('updateBoardDestsAndColorTurn');
      this.get('chessBoardComponent').send('updateYourPgn');
    },

    undoMove: function() {
      this.get('chessBoardComponent').send('undoMove');
    },

    startGameOver: function() {
      this.get('chessBoardComponent').send('resetBoardAndGame');
      this.get('chessBoardComponent').send('resetData');
      this.get('chessBoardComponent').send('resetBoardStyles');

      Ember.$('.engine-data').text('');
    },

    startPos: function() {
      this.get('chessBoardComponent').send('startPos');
      this.get('chessBoardComponent').send('removeActive');
    },

    engineData: function(data) {
      var game = this.get("gameObject");
      var score = data.score;

      if (score) {
        if (game.turn() === 'b' && score[0] !== '#') {
          score = score * -1;
        } else if (game.turn() === 'b' && score[0] === "#") {
          score = score.slice(score.indexOf("-"), 1);
        }
        Ember.$("#score").text(score);
      }

      if (data.bestmove) {
        Ember.$("#bestmove").text(data.bestmove);
      }

      if (data.variation) {
        Ember.$("#variation").text(data.variation);
      }

      if (data.depth) {
        Ember.$("#depth").text(data.depth);
      }
    },

    turnDiagramModeOn: function() {
      Ember.$('canvas').addClass('diagram-mode');
      this.set('diagramMode', true);
    },

    turnDiagramModeOff: function() {
      Ember.$('canvas').removeClass('diagram-mode');
      this.set('diagramMode', false);
    },

    drawForOthers: function(data) {
      var x, y;
      if(this.get('orientation') !== data.orientation && this.get('orientation') === 'white') {
        x = Ember.$('#diagram').height() - data.x;
        y = Ember.$('#diagram').width() - data.y;
      } else if(this.get('orientation') === data.orientation && this.get('orientation') === 'black') {
        x = Ember.$('#diagram').height() - data.x;
        y = Ember.$('#diagram').width() - data.y;
      } else {
        x = data.x;
        y = data.y;
      }
      var type = data.type;
      var paint = data.paint;
      var context = document.getElementById('diagram').getContext('2d');

      if (type === "mousedown") {
        context.beginPath();
        return context.moveTo(x, y);
      } else if (type === "mousemove") {
        if (paint) {
            context.lineTo(x, y);
        }
        return context.stroke();
      }
    },

    clearDiagram: function() {
      var context = document.getElementById('diagram').getContext('2d');
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    },

    canIhaveYourGameData: function(data) {
      var dataObj = {};
      dataObj.data = this.get('dataObject');
      dataObj.socketId = data.socketId;
      dataObj.gameFen = this.get('gameObject').fen();
      dataObj.boardFen = this.get('boardObject').getFen();
      dataObj.analysisOn = this.get('stockfishAnalysis');
      this.socket.emit('update client', dataObj);
    },

    getUpdated: function(obj) {
      this.get('boardObject').set({
        fen: obj.boardFen,
        lastMove: [obj.from, obj.to]
      });
      this.get('gameObject').load(obj.gameFen);
      this.set('dataObject', obj.data);

      this.get('chessBoardComponent').send('setData');
      this.get('chessBoardComponent').send('updateBoardDestsAndColorTurn');
      this.get('chessBoardComponent').send('updateYourPgn');
      if (obj.analysisOn) {
        this.socket.emit('start analyzing', { fen: this.get('gameObject').fen() });
      }
    },

    stockfishOn: function() {
      this.set('stockfishAnalysis', true);

      this.get('iosSwitch').send('turnOnSwitch');
      this.get('iosSwitch').send('updateSwitchStatus');
    },

    stockfishOff: function() {
      this.set('stockfishAnalysis', false);
      Ember.$('.engine-data').text('');

      this.get('iosSwitch').send('turnOffSwitch');
      this.get('iosSwitch').send('updateSwitchStatus');
    }
  }
});
