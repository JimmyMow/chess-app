import Ember from 'ember';

export default Ember.ObjectController.extend({
  linkUrl: window.location.href,
  sandboxMode: false,
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
  fenDataObject: null,
  detailsObj: null,
  puzzleFenString: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  puzzleGameFenString: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',

  actions: {
    changeSandbox: function() {
      this.toggleProperty('sandboxMode');
    },
    clearBoard: function() {
      this.get('chessBoardComponent').send('clearBoard');
      this.socket.emit('clear board');
    },

    startingPos: function() {
      this.get('chessBoardComponent').send('startingPos');
      this.socket.emit('starting pos');
    },

    updatePgnView: function() {
      if (this.get('dataObject').tree.length > 0) {
        this.get('chessBoardComponent').send('updateYourPgn');
      }
    },

    sandboxMode: function() {
      this.toggleProperty('sandboxMode');
      this.get('chessBoardComponent').send('sandboxMode');
      this.socket.emit('sandbox mode clicked');
      if (this.get('stockfishAnalysis')) {
        this.socket.emit('stop analyzing');
      }
    },

    puzzleClicked: function(data) {
      this.socket.emit('puzzle clicked', data);
      if (this.get('detailsObj')) {
        this.set('detailsObj', null);
      }
    },

    sandboxModeWithPos: function() {
      if (this.get('detailsObj')) {
        this.set('detailsObj', null);
      }
      this.toggleProperty('sandboxMode');
      this.socket.emit('sandbox mode clicked with pos', { fenData: this.get('fenDataObject') });
      if (this.get('stockfishAnalysis')) {
        this.socket.emit('stop analyzing');
      }
      this.get('chessBoardComponent').send('sandboxModeWithPos');
    },

    sendPosition: function(data) {
      data.stockfish = this.get('stockfishAnalysis');
      this.socket.emit('sendPosition', data);
      if (data.stockfish) {
        Ember.$('#bestmove').text('');
      }
    },

    sandboxPosition: function(data) {
      this.socket.emit('sandbox position', data);
    },

    // sendDiagram: function(data) {
    //   this.socket.emit('send diagram', data);
    // },

    addPoints: function() {
      var shapes = this.get('boardObject').dump().drawable.shapes;
      this.socket.emit('send points', { points: shapes });
    },

    removePoints: function() {
      this.socket.emit('remove points');
    },

    startOver: function() {
      this.get('chessBoardComponent').send('resetBoardAndGame');
      this.get('chessBoardComponent').send('resetData');
      this.get('chessBoardComponent').send('resetBoardStyles');
      Ember.$('.engine-data').text('');
      this.socket.emit('startingGameOver');
      if (this.get('detailsObj')) {
        this.set('detailsObj', null);
      }
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

      Ember.$('#diagram').toggleClass('flipTest');
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
    },

    submitPgn: function() {
      var pgn = Ember.$('#pgnUpload').val();
      var details = {};
      pgn.replace(/\[(.+?)\]/g, function($0, $1) {
        details[$1.substr(0,$1.indexOf(' '))] = $1.replace(/['"]+/g, '').substr($1.indexOf(' ')+1);
      });
      this.set('detailsObj', details);
      var tree = this.get('gameObject').load_pgn(pgn);
      if(!tree) {
        alert('There was a problem with the PGN you tried to upload. Please make sure it is standard and follows all the PGN formatting rules.');
        return;
      } else {
        Ember.$.modal.close();
      }
      this.get('dataObject').tree = tree;
      this.get('gameObject').load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

      this.get('chessBoardComponent').send('uploadPgn');
      this.socket.emit('upload pgn', { pgn: pgn, gameDetails: details });
    },

    submitNote: function() {
      this.get('chessBoardComponent').send('submitNote');
      Ember.$("#noteForm textarea").val("");
    },

    sendNote: function(data) {
      this.socket.emit('send note', data);
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

      if (this.get('stockfishAnalysis')) {
        Ember.$('#bestmove').text('');
      }

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
      if (this.get('detailsObj')) {
        this.set('detailsObj', null);
      }
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
        var moveObjects = game.moves({ verbose: true });
        var pgnMove = _.find(moveObjects, function(x) {
            var from = data.bestmove.slice(0, 2);
            var to = data.bestmove.slice(2, 4);
            return x.from === from && x.to === to;
        });
        Ember.$("#bestmove").text(pgnMove.san);
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

    addPointsForOthers: function(data) {
      var boardData = this.get('boardObject').dump();
      boardData.drawable.shapes = data.points;
      boardData.render();
    },

    removePointsForOthers: function() {
      var boardData = this.get('boardObject').dump();
      if (!boardData.drawable.shapes.length) {
        return;
      }
      boardData.drawable.shapes = [];
      boardData.render();
    },

    canIhaveYourGameData: function(data) {
      var dataObj = {};
      dataObj.data = this.get('dataObject');
      dataObj.socketId = data.socketId;
      dataObj.gameFen = this.get('gameObject').fen();
      dataObj.boardFen = this.get('boardObject').getFen();
      dataObj.analysisOn = this.get('stockfishAnalysis');
      dataObj.sandboxMode = this.get('sandboxMode');
      dataObj.shapes = this.get('boardObject').dump().drawable.shapes;
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
      if ( obj.sandboxMode ) {
        this.get('chessBoardComponent').send('sandboxMode');
        this.send('changeSandbox');
      }

      if ( obj.shapes ) {
        var boardData = this.get('boardObject').dump();
        boardData.drawable.shapes = obj.shapes;
        boardData.render();
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
    },

    uploadTheirPgn: function(obj) {
      var tree = this.get('gameObject').load_pgn(obj.pgn);
      if(!tree) {
        alert('There was a problem with the PGN you tried to upload. Please make sure it is standard and follows all the PGN formatting rules.');
        return;
      }
      this.get('dataObject').tree = tree;
      this.get('gameObject').load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      this.set('detailsObj', obj.gameDetails);
      this.get('chessBoardComponent').send('uploadPgn');
    },

    sandboxModeClicked: function() {
      this.get('chessBoardComponent').send('sandboxMode');
      this.send('changeSandbox');
    },

    sandboxModeClickedWithPosition: function(data) {
      var dataObj = this.get('fenDataObject');
      dataObj.toPlay = data.fenData.toPlay;
      dataObj.whiteKingCastles = data.fenData.whiteKingCastles;
      dataObj.whiteQueenCastles = data.fenData.whiteQueenCastles;
      dataObj.blackKingCastles = data.fenData.blackKingCastles;
      dataObj.blackQueenCastles = data.fenData.blackQueenCastles;
      this.get('chessBoardComponent').send('sandboxModeWithPos');
      this.send('changeSandbox');
      if (this.get('detailsObj')) {
        this.set('detailsObj', null);
      }
    },

    getThePuzzleClicked: function(data) {
      this.set('puzzleFenString', data.boardfen);
      this.set('puzzleGameFenString', data.gamefen);
      this.get('chessBoardComponent').send('puzzleClicked');

      if (this.get('detailsObj')) {
        this.set('detailsObj', null);
      }
    },

    sandboxPositionChanged: function(data) {
      this.get('boardObject').set({
        fen: data.boardFen,
        lastMove: null
      });
    },

    sandboxClearBoard: function() {
      this.get('chessBoardComponent').send('clearBoard');
    },

    sandboxStartingPos: function() {
      this.get('chessBoardComponent').send('startingPos');
    },

    addNewNote: function(data) {
      this.get('dataObject').tree = data.tree;
      this.get('chessBoardComponent').send('updateYourPgn');
    }
  }
});
