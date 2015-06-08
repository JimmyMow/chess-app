import Ember from 'ember';
import InboundActions from 'ember-component-inbound-actions/inbound-actions';
import Notify from 'ember-notify';

export default Ember.Component.extend(InboundActions, {
  tag: 'div',
  classNames: ['chess-board'],
  classNameBindings: ['sandboxMode'],
  board: null,
  game: null,
  data: null,
  variationActive: false,
  emptyMove: m('em.move.empty', '...'),
  sparePiece: null,
  sandboxCfg: null,
  reviewCfg: null,
  sandboxMode: null,
  startPosString: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  fenData: {
    toPlay: 'w',
    whiteKingCastles: 'K',
    whiteQueenCastles: 'Q',
    blackKingCastles: 'k',
    blackQueenCastles: 'q',
  },
  notifyOn: true,
  actions: {
    hideMenu: function() {
      Ember.$('.room-menu').removeClass('active');
      Ember.$('.arrow').removeClass('close');
      Ember.$('#ham-plate').removeClass('close');
    },
    submitNote: function() {
      var note = Ember.$('#noteForm textarea').val();
      var pathStr = Ember.$("#notePath").val();
      var path = this.get('readPath')(pathStr);
      var move = this.get('findMoveInTree')(this.get('data').tree, path);
      move.comments.push(note);
      this.send('updateYourPgn');
      Ember.$.modal.close();

      this.get('sendNote')(this, this.get('data').tree);
    },

    clearBoard: function() {
      this.get('board').set({
        fen: '8/8/8/8/8/8/8/8',
        lastMove: null
      });
    },

    startingPos: function() {
      var startPos = this.get('startPos');
      this.get('board').set({
        fen: 'start',
        lastMove: null
      });
    },

    sandboxMode: function() {
      this.toggleProperty('sandboxMode');
      if( this.get('sandboxMode') ) {
        this.send('sandboxOn');
      } else {
        this.send('sandboxOff');
      }
    },

    puzzleClickedSetup: function() {
      this.get('puzzleClickedSocket')(this, this.get('parentController.puzzleFenString'), this.get('parentController.puzzleGameFenString'));
      this.send('puzzleClicked');
    },

    puzzleClicked: function() {
      this.set('sandboxMode', false);
      this.get('game').load(this.get('parentController.puzzleGameFenString'));
      var cfg = this.get('reviewCfg');
      this.set('startPosString', this.get('parentController.puzzleGameFenString'));
      cfg.fen = this.get('parentController.puzzleFenString');
      cfg.lastMove = null;
      cfg.selected = null;
      cfg.movable.dests = this.get('chessToDests')(this.get('game'));
      this.get('board').set(cfg);
      m.render(document.getElementById('pgn'), null);
      this.set('data', {
        tree: [],
        pathDefault: [{ ply: 0, variation: null }],
        path: [{ ply: 0, variation: null }],
        pathStr: ''
      });
      this.send('hideMenu');
    },

    sandboxModeWithPos: function() {
      var computedFen = this.get('computeFen')(this);
      this.set('sandboxMode', false);
      this.get('game').load(computedFen);
      var cfg = this.get('reviewCfg');
      var boardfen = this.get('board').getFen();
      this.set('startPosString', computedFen);
      cfg.fen = boardfen;
      cfg.lastMove = null;
      cfg.selected = null;
      cfg.movable.dests = this.get('chessToDests')(this.get('game'));
      this.get('board').set(cfg);
      this.set('data', {
        tree: [],
        pathDefault: [{ ply: 0, variation: null }],
        path: [{ ply: 0, variation: null }],
        pathStr: ''
      });
      console.log('here with hawk');
      console.log('pgn: ', document.getElementById('pgn'))
      m.render(document.getElementById('pgn'), null);
    },

    sandboxOff: function() {
      var cfg = this.get('reviewCfg');
      var currMove = this.get('findMoveInTree')(this.get('data').tree, this.get('data').path);
      if (currMove) {
        cfg.fen = currMove.boardFen;
        cfg.lastMove = [currMove.from, currMove.to];
      } else {
        cfg.lastMove = null;
      }
      cfg.selected = null;
      cfg.movable.dests = this.get('chessToDests')(this.get('game'));
      this.get('board').set(cfg);
      Ember.$('.spare').addClass('deactivated');
    },

    sandboxOn: function() {
      var cfg = this.get('sandboxCfg');
      this.get('board').set(cfg);
      Ember.$('.spare').removeClass('deactivated');
      if (this.get('notifyOn')) {
        Notify.info({
          raw: "<div>You are now in sandbox mode! Sandbox mode is for setting up positions, puzzles, clearing the board, etc. Normal chess rules don't apply.</div>",
          closeAfter: 10000
        });
      }
      this.set('notifyOn', false);
      this.set('fenData', {
        toPlay: 'w',
        whiteKingCastles: 'K',
        whiteQueenCastles: 'Q',
        blackKingCastles: 'k',
        blackQueenCastles: 'q',
      });
    },

    setData: function() {
      this.set('data', this.get('targetObject.dataObject'));
    },
    updateBoardDestsAndColorTurn: function() {
      var board = this.get('board');
      var chess = this.get('game');
      board.set({
        turnColor: this.get('chessToColor')(chess),
        movable: {
          dests: this.get('chessToDests')(chess)
        }
      });
    },
    updateYourPgn: function() {
      this.get('displayTree')(this);
      var movelist = document.getElementsByClassName('movelist')[0];
      var plyEl = movelist.querySelector('.active');
      if (plyEl) {
        movelist.scrollTop = plyEl.offsetTop - movelist.offsetHeight / 2 + plyEl.offsetHeight / 2;
      }
    },

    resetBoardAndGame: function() {
      if (!this.get('board') || !this.get('game')) {
        return;
      }
      this.get('game').reset();
      this.get('board').set({
        fen: 'start',
        lastMove: null,
        movable: {
          dests: this.get('chessToDests')(this.get('game'))
        }
      });
      this.set('startPosString', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    },

    startPos: function() {
      var chess = this.get('game');
      var chessground = this.get('board');
      var data = this.get('data');
      var startPos = this.get('startPosString');
      chess.load(startPos);
      chessground.set({
        fen: startPos,
        lastMove: null,
        turnColor: this.get('chessToColor')(chess),
        movable: {
          dests: this.get('chessToDests')(chess)
        }
      });
      data.path = [{ ply: 0, variation: null }];
      data.pathStr = '';
    },

    resetBoardStyles: function() {
      m.render(document.getElementById('pgn'), '');
    },

    removeActive: function() {
      Ember.$('.move').removeClass('active');
    },

    resetData: function() {
      if (!this.get('data')) {
        return;
      }
      var data = this.get('data');
      data.tree = [];
      data.path = data.pathDefault;
      data.pathStr = '';
      data.variationActive = false;
    },

    undoMove: function() {
      var data = this.get('data');
      var index = data.tree.length - 1;

      this.get('prev')(this);
      data.tree.splice(index, 1);
      this.get('displayTree')(this);
    },

    uploadPgn: function() {
      Ember.$('.move').removeClass('active');
      this.get('displayTree')(this);
      Ember.$('#pgnUpload').val('');
      this.get('board').set({
        fen: 'start',
        lastMove: null
      });
      this.set('startPosString', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      this.get('data').pathStr = '';
      this.get('data').path = this.get('data').pathDefault;
    }
  },
  ////////////////////
  //socket functions//
  ////////////////////
  sendPosition: function(component, gameFen, boardFen, from, to, data) {
    component.sendAction('position', { gameFen: gameFen, boardFen: boardFen, from: from, to: to, data: data });
  },
  sendStart: function(component) {
    component.sendAction('strt');
  },
  sendSandboxPosition: function(component, boardFen) {
    component.sendAction('sandboxPstn', { boardFen: boardFen});
  },
  sendNote: function(component, tree) {
    component.sendAction('newNote', { tree: tree });
  },
  addPoints: function(component) {
    component.sendAction('addP');
  },
  removePoints:function(component) {
    component.sendAction('removeP');
  },
  puzzleClickedSocket: function(component, boardfen, gamefen) {
    component.sendAction('puzzleC', { boardfen: boardfen, gamefen: gamefen });
  },
  //////////////////////////
  //chess logic functions//
  /////////////////////////
  computeFen: function(component) {
    var data = component.get('fenData');
    var finalCastleData = component.get('computeFenCastles')(component, data);
    var boardFen = component.get('board').getFen();
    var res = boardFen + ' ' + data.toPlay + ' ' + finalCastleData + ' - 0 1';
    return res;
  },

  computeFenCastles: function(component, data) {
    var castles = '';
    Object.keys(data).forEach(function(piece) {
      if (piece !== 'toPlay' && data[piece]) {
        castles += data[piece];
      }
    });
    return castles.length ? castles : '-';
  },

  chessToDests: function(chess) {
    var dests = {};
    chess.SQUARES.forEach(function(square) {
      var ms = chess.moves({square: square, verbose: true});
      if (ms.length) {
        dests[square] = ms.map(function(m) { return m.to; });
      }
    });
    return dests;
  },
  chessToColor: function(chess) {
    return (chess.turn() === "w") ? "white" : "black";
  },
  didTheyCastle: function(fromTo) {
    switch (fromTo) {
      case "e1-g1":
        return { from: "h1", to: "f1" };
      case "e8-g8":
        return { from: "h8", to: "f8" };
      case "e1-c1":
        return { from: "a1", to: "d1" };
      case "e8-c8":
        return { from: "a8", to: "d8" };
      default:
        return false;
    }
  },
  //////////////////////////
  // _________ functions //
  /////////////////////////
  explore: function(component, path, san, boardFen, gameFen, fromToObj) {
    var nextPath = component.get('withPly')(component, path, component.get('currentPly')(component.get('data').path) + 1);
    var tree = component.get('data').tree;
    var curMove = null;
    var nb;
    nextPath.forEach(function(step) {
      for (i = 0, nb = tree.length; i < nb; i++) {
        var move = tree[i];
        if (step.ply === move.ply) {
          if (step.variation) {
            tree = move.variations[step.variation - 1];
            break;
          } else {
            curMove = move;
          }
        } else if (step.ply < move.ply) {
          break;
        }
      }
    });
    if (curMove) {
      if (curMove.san === san) {
        return nextPath;
      }
      for (var i = 0; i < curMove.variations.length; i++) {
        if (curMove.variations[i][0].san === san) {
          return component.get('withVariation')(component, nextPath, i + 1);
        }
      }
      curMove.variations.push([{
        ply: curMove.ply,
        san: san,
        boardFen: boardFen,
        gameFen: gameFen,
        from: fromToObj.from,
        to: fromToObj.to,
        comments: [],
        variations: []
      }]);
      return component.get('withVariation')(component, nextPath, curMove.variations.length);
    }
    tree.push({
      ply: component.get('currentPly')(nextPath),
      san: san,
      boardFen: boardFen,
      gameFen: gameFen,
      from: fromToObj.from,
      to: fromToObj.to,
      comments: [],
      variations: []
    });
    return nextPath;
  },
  withPly: function(component, path, ply) {
    var p2 = path.slice(0);
    var last = p2.length - 1;
    p2[last] = component.get('copy')(p2[last], {ply: ply});
    return p2;
  },
  withVariation: function(component, path, index) {
    var p2 = path.slice(0);
    var last = p2.length - 1;
    var ply = p2[last].ply;
    p2[last] = component.get('copy')(p2[last], {
      ply: ply,
      variation: index
    });
    p2.push({
      ply: ply,
      variation: null
    });
    return p2;
  },
  currentPly: function(path) {
    return path[path.length - 1].ply;
  },
  writePath: function(path) {
    return path.map(function(step) {
      return step.variation ? step.ply + ':' + step.variation : step.ply;
    }).join(',');
  },
  readPath: function(str) {
    return str.split(',').map(function(step) {
      var s = step.split(':');
      return {
        ply: parseInt(s[0]),
        variation: s[1] ? parseInt(s[1]) : null
      };
    });
  },
  plyToTurn: function(ply) {
    return Math.floor((ply - 1) / 2) + 1;
  },
  ////////////////////////////
  // general help functions //
  ///////////////////////////
  copy: function(obj, newValues) {
    var k, c = {};
    for (k in obj) {
      c[k] = obj[k];
    }
    for (k in newValues) {
      c[k] = newValues[k];
    }
    return c;
  },
  //////////////////////////////
  // pgn generation functions //
  //////////////////////////////
  displayTree: function(component) {
    var tree = component.get('renderTree')(component, component.get('data').tree);
    return m.render(document.getElementById('pgn'), tree);
  },
  renderTree: function(component, tree) {
    var data = component.get('data');
    var turns = [];
    for (var i = 0, nb = tree.length; i < nb; i += 2) {
      turns.push({
        turn: Math.floor(i / 2) + 1,
        white: tree[i],
        black: tree[i + 1]
      });
    }
    var path = data.pathDefault;
    return turns.map(function(turn) {
      return component.get('renderTurn')(component, turn, path);
    });
  },
  renderTurn: function(component, turn, path) {
    var index = component.get('renderIndex')(turn.turn);
    var wPath = turn.white ? component.get('withPly')(component, path, turn.white.ply) : null;
    var wMove = wPath ? component.get('renderMove')(component, turn.white, wPath) : null;
    var wMeta = component.get('renderMeta')(component, turn.white, wPath);
    var bPath = turn.black ? component.get('withPly')(component, path, turn.black.ply) : null;
    var bMove = bPath ? component.get('renderMove')(component, turn.black, bPath) : null;
    var bMeta = component.get('renderMeta')(component, turn.black, bPath);

    if (wMove) {
      if (wMeta) {
        return [
          component.get('renderTurnDiv')([index, wMove, component.get('emptyMove')]),
          wMeta,
          bMove ? [
            component.get('renderTurnDiv')([index, component.get('emptyMove'), bMove]),
            bMeta
          ] : null,
        ];
      }
      return [
        component.get('renderTurnDiv')([index, wMove, bMove]),
        bMeta
      ];
    }
    return [
      component.get('renderTurnDiv')([index, component.get('emptyMove'), bMove]),
      bMeta
    ];
  },
  renderIndex: function(txt) {
    return {
      tag: 'span',
      attrs: {
        class: 'index'
      },
      children: [txt]
    };
  },
  renderTurnDiv: function(children) {
    return {
      tag: 'div',
      attrs: {
        class: 'turn',
      },
      children: children
    };
  },
  renderMove: function(component, move, path) {
    var data = component.get('data');
    if (!move) {
      return component.get('emptyMove');
    }
    var pathStr = component.get('writePath')(path);
    return {
      tag: 'a',
      attrs: {
        class: 'move' + (pathStr === data.pathStr ? ' active' : ''),
        'data-path': pathStr,
        'href': '#' + path[0].ply
      },
      children: [
        move.san, m('a.add-note', {path: pathStr, href: "#noteForm", rel: "modal:open", san: move.san}, m('i.fa fa-pencil-square-o'))
      ]
    };
  },
  renderMeta: function(component, move, path) {
    if (!move || (!move.comments.length && !move.variations.length)) {
      return;
    }
    var children = [];
    if (move.comments.length > 0) {
      move.comments.forEach(function(comment) {
        children.push(m('div.comment', comment));
      });
    }
    var border = children.length === 0;
    if (move.variations.length) {
      move.variations.forEach(function(variation, i) {
        children.push(component.get('renderVariation')(component, variation, component.get('withVariation')(component, path, i + 1), border));
        border = false;
      });
    }
    return children;
  },
  renderVariation: function(component, variation, path, border) {
    return m('div', {
      class: 'variation' + (border ? ' border' : '')
    }, component.get('renderVariationContent')(component, variation, path));
  },
  renderVariationContent: function(component, variation, path) {
    var turns = [];
    if (variation[0].ply % 2 === 0) {
      variation = variation.slice(0);
      var move = variation.shift();
      turns.push({
        turn: component.get('plyToTurn')(move.ply),
        black: move
      });
    }
    for (var i = 0, nb = variation.length; i < nb; i += 2) {
      turns.push({
        turn: component.get('plyToTurn')(variation[i].ply),
        white: variation[i],
        black: variation[i + 1]
      });
    }
    return turns.map(function(turn) {
      return component.get('renderVariationTurn')(component, turn, path);
    });
  },
  renderVariationTurn: function(component, turn, path) {
    var wPath = turn.white ? component.get('withPly')(component, path, turn.white.ply) : null;
    var wMove = wPath ? component.get('renderMove')(component, turn.white, wPath) : null;
    var wMeta = component.get('renderVariationMeta')(component, turn.white, wPath);
    var bPath = turn.black ? component.get('withPly')(component, path, (turn.black.ply)) : null;
    var bMove = bPath ? component.get('renderMove')(component, turn.black, bPath) : null;
    var bMeta = component.get('renderVariationMeta')(component, turn.black, bPath);
    if (wMove) {
      if (wMeta) {
        return [
          component.get('renderIndex')(turn.turn + '.'),
          wMove,
          wMeta,
          bMove ? [
            bMove,
            bMeta
          ] : null
        ];
      }
      return [component.get('renderIndex')(turn.turn + '.'), wMove, (bMove ? [' ', bMove, bMeta] : '')];
    }
    return [component.get('renderIndex')(turn.turn + '...'), bMove, bMeta];
  },
  renderVariationMeta: function(component, move, path) {
    if (!move || (!move.comments.length && !move.variations.length)) {
      return;
    }
    var children = [];
    if (move.comments.length > 0) {
      move.comments.forEach(function(comment) {
        children.push(m('div.comment', comment));
      });
    }
    var border = children.length === 0;
    if (move.variations.length) {
      move.variations.forEach(function(variation, i) {
        children.push(component.get('renderVariationNested')(component, variation, component.get('withVariation')(component, path, i + 1)));
        border = false;
      });
    }
    return children;
    // return move.variations.map(function(variation, i) {
    //   return component.get('renderVariationNested')(component, variation, component.get('withVariation')(component, path, i + 1));
    // });
  },
  renderVariationNested: function(component, variation, path) {
    return m('span.variation', [
      '(',
      component.get('renderVariationContent')(component, variation, path),
      ')'
    ]);
  },
  ///////////////////////
  // control functions //
  ///////////////////////
  whichControl: function(component, direction) {
    var data = component.get('data');
    switch (direction) {
      case 'first':
        component.get('start')(component);
      break;
      case 'prev':
        component.get('prev')(component);
      break;
      case 'next':
        component.get('next')(component);
      break;
      case 'last':
        component.get('jump')(component, [{ ply: data.tree.length, variation: null }]);
      break;
    }
  },
  start: function(component) {
    component.send('startPos');
    component.get('sendStart')(component);
    component.send('removeActive');
  },
  prev: function(component) {
    var data = component.get('data');
    var p = data.path;
    var len = p.length;
    if (len === 1) {
      if (p[0].ply === 0) {
        return;
      }
      p[0].ply--;
    } else {
      if (p[len - 1].ply > p[len - 2].ply) {
        p[len - 1].ply--;
      }
      else {
        p.pop();
        p[len - 2].variation = null;
        if (p[len - 2].ply > 1) {
          p[len - 2].ply--;
        }
      }
    }
    component.get('jump')(component, p);
  },
  next: function(component) {
    var data = component.get('data');
    if (!component.get('canGoForward')(component)) {
      return;
    }
    var p = data.path;
    p[p.length - 1].ply++;
    component.get('jump')(component, p);
  },
  jump: function(component, path) {
    var data = component.get('data');
    data.path = path;
    data.pathStr = component.get('writePath')(path);
    var ply = path[path.length - 1].ply;
    if (ply < 1) {
      return component.get('start')(component);
    }
    var lastMove = component.get('findMoveInTree')(data.tree, data.path);
    component.get('reposition')(component, lastMove);
    component.get('addActive')(component);
    component.get('sendPosition')(component, component.get('game').fen(), component.get('board').getFen(), lastMove.from, lastMove.to, data);
    var movelist = document.getElementsByClassName('movelist')[0];
    var plyEl = movelist.querySelector('.active');
    if (plyEl) {
      movelist.scrollTop = plyEl.offsetTop - movelist.offsetHeight / 2 + plyEl.offsetHeight / 2;
    }
  },
  moveList: function(component, path) {
    var data = component.get('data');
    var tree = data.tree;
    var moves = [];
    path.forEach(function(step) {
      for (var i = 0, nb = tree.length; i < nb; i++) {
        var move = tree[i];
        if (step.ply === move.ply && step.variation) {
          tree = move.variations[step.variation - 1];
          break;
        } else if (step.ply >= move.ply) {
          moves.push({ san: move.san, boardFen: move.boardFen, gameFen: move.gameFen, from: move.from, to: move.to });
        }
        else {
          break;
        }
      }
    });
    return moves;
  },
  findMoveInTree: function(tree, path) {
    var arrayThing = tree;
    for (var i = 0; i < path.length; i++) {
      var ply = path[i].ply;
      var variation = path[i].variation;
      if(!variation) {
        if (!arrayThing.length) {
          // return {
          //   boardFen: 'start',
          //   gameFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          //   san: null,
          //   ply: null,
          //   from: null,
          //   to: null,
          //   variations: []
          // };
          return false;
        }
        var move = arrayThing[parseInt(ply) - parseInt(arrayThing[0].ply)];
        return move;
      }
      arrayThing = arrayThing[ply - arrayThing[0].ply].variations[variation - 1];
    }
  },
  findArrInTree: function(tree, path) {
    var arrayThing = tree;
    for (var i = 0; i < path.length; i++) {
      var ply = path[i].ply;
      var variation = path[i].variation;
      if(!variation) {
        return arrayThing;
      }
      arrayThing = arrayThing[ply - arrayThing[0].ply].variations[variation - 1];
    }
  },
  reposition: function(component, move) {
    var chess = component.get('game');
    var chessground = component.get('board');
    chess.load(move.gameFen);
    chessground.set({
      fen: move.boardFen,
      turnColor: component.get('chessToColor')(chess),
      lastMove: [move.from, move.to],
      movable: {
        dests: component.get('chessToDests')(chess)
      }
    });
  },
  canGoForward: function(component) {
    var data = component.get('data');
    var tree = data.tree;
    var ok = false;
    data.path.forEach(function(step) {
      for (var i = 0, nb = tree.length; i < nb; i++) {
        var move = tree[i];
        if (step.ply === move.ply && step.variation) {
          tree = move.variations[step.variation - 1];
          break;
        } else {
          ok = step.ply < move.ply;
        }
      }
    });
    return ok;
  },
  /////////////////////
  // style functions //
  /////////////////////
  addActive: function(component) {
    var data = component.get('data');
    Ember.$('.move').removeClass('active');
    Ember.$("a[data-path='" + data.pathStr +"']").addClass('active');
  },
  makeConfetti: function() {
    var COLORS, Confetti, NUM_CONFETTI, PI_2, canvas, confetti, context, drawCircle, i, range, resizeWindow, xpos;

    NUM_CONFETTI = 350;

    COLORS = [[85, 71, 106], [174, 61, 99], [219, 56, 83], [244, 92, 68], [248, 182, 70]];

    PI_2 = 2 * Math.PI;

    canvas = document.getElementById("world");

    context = canvas.getContext("2d");

    var w = 0;

    var h = 0;

    resizeWindow = function() {
      w = canvas.width = window.innerWidth;
      return h = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeWindow, false);

    setTimeout(resizeWindow, 0);

    range = function(a, b) {
      return (b - a) * Math.random() + a;
    };

    drawCircle = function(x, y, r, style) {
      context.beginPath();
      context.arc(x, y, r, 0, PI_2, false);
      context.fillStyle = style;
      return context.fill();
    };

    xpos = 0.5;

    document.onmousemove = function(e) {
      return xpos = e.pageX / w;
    };

    window.requestAnimationFrame = (function() {
      return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
        return window.setTimeout(callback, 1000 / 60);
      };
    })();

    Confetti = (function() {
      function Confetti() {
        this.style = COLORS[~~range(0, 5)];
        this.rgb = "rgba(" + this.style[0] + "," + this.style[1] + "," + this.style[2];
        this.r = ~~range(2, 6);
        this.r2 = 2 * this.r;
        this.replace();
      }

      Confetti.prototype.replace = function() {
        this.opacity = 0;
        this.dop = 0.03 * range(1, 4);
        this.x = range(-this.r2, w - this.r2);
        this.y = range(-20, h - this.r2);
        this.xmax = w - this.r;
        this.ymax = h - this.r;
        this.vx = range(0, 2) + 8 * xpos - 5;
        return this.vy = 0.7 * this.r + range(-1, 1);
      };

      Confetti.prototype.draw = function() {
        var _ref;
        this.x += this.vx;
        this.y += this.vy;
        this.opacity += this.dop;
        if (this.opacity > 1) {
          this.opacity = 1;
          this.dop *= -1;
        }
        if (this.opacity < 0 || this.y > this.ymax) {
          this.replace();
        }
        if (!((0 < (_ref = this.x) && _ref < this.xmax))) {
          this.x = (this.x + this.xmax) % this.xmax;
        }
        return drawCircle(~~this.x, ~~this.y, this.r, this.rgb + "," + this.opacity + ")");
      };

      return Confetti;

    })();

    confetti = (function() {
      var _i, _results;
      _results = [];
      for (i = _i = 1; 1 <= NUM_CONFETTI ? _i <= NUM_CONFETTI : _i >= NUM_CONFETTI; i = 1 <= NUM_CONFETTI ? ++_i : --_i) {
        _results.push(new Confetti());
      }
      return _results;
    })();

    var step = function() {
      var c, _i, _len, _results;
      requestAnimationFrame(step);
      context.clearRect(0, 0, w, h);
      _results = [];
      for (_i = 0, _len = confetti.length; _i < _len; _i++) {
        c = confetti[_i];
        _results.push(c.draw());
      }
      return _results;
    };

    step();
  },
  ////////////////////////////
  // element ready function //
  ////////////////////////////
  didInsertElement: function() {
    if ( this.get('data').tree.length ) {
      this.set('data', {
        tree: [],
        pathDefault: [{ ply: 0, variation: null }],
        path: [{ ply: 0, variation: null }],
        pathStr: ''
      });
    }
    var _this = this;
    var chess = new Chess();
    this.set('game', chess);
    var onMove = function(from, to) {
      var dump = _this.get('board').dump();
      var piece = dump.pieces[to];
      var game = _this.get('game');
      var promotionCheat = {
        'q': 'queen',
        'r': 'rook',
        'b': 'bishop',
        'n': 'knight'
      }
      var promotion = {
        piece: null,
        color: null
      };
      if (piece && piece.role == 'pawn') {
        if ( (to[1] == 1 && game.turn() == 'b') || (to[1] == 8 && game.turn() == 'w') ) {
          promotion.piece = 'q';
          promotion.color = game.turn() === 'w' ? 'white' : 'black';
        }
      }
      var chess = _this.get('game');
      var castle = _this.get('didTheyCastle')(from+"-"+to);
      if(castle) {
        _this.get('board').move(castle.from, castle.to);
        _this.get('board').set({
          lastMove: [from, to]
        });
      }
      var move = promotion ? chess.move({from: from, to: to, promotion: promotion.piece}) : chess.move({from: from, to: to});
      if (promotion.piece) {
        var x = {color: promotion.color, role: promotionCheat[promotion.piece]};
        var y = {};
        y[to] = x;
        _this.get('board').setPieces(y);
      }
      if (move.flags === 'e') {
        var x = _this.get('game').turn() === 'b' ? -1 : 1;
        var square = to[0] + (parseInt(to[1]) + x);
        var res = {};
        res[square] = null;

        _this.get('board').setPieces(res);
      }
      // chess.move({from: from, to: to});
      _this.get('board').set({
        turnColor: _this.get('chessToColor')(chess),
        movable: {
          dests: _this.get('chessToDests')(chess)
        }
      });
      var data = _this.get('data');
      data.path = _this.get('explore')(_this, data.path, move.san, chess.fen().split(' ')[0], chess.fen(), { from: from, to: to });
      data.pathStr = _this.get('writePath')(data.path);
      _this.send('removeActive');
      _this.get('displayTree')(_this);
      _this.get('sendPosition')(_this, _this.get('game').fen(), _this.get('board').getFen(), from, to, _this.get('data'));
    };
    var promotionStart = function() {

    };
    var reviewCfg = {
      turnColor: _this.get('chessToColor')(chess),
      orientation: 'white',
      coordinates: true,
      animation: {
        enabled: true,
        duration: 300
      },
      movable: {
        free: false,
        color: 'both',
        dropOff: 'revert',
        dests: _this.get('chessToDests')(chess),
        events: {
          after: onMove
        }
      },
      events: {
        change: function() {

        },
        afterDraw: function() {
          _this.get('addPoints')(_this);
        },
        clearDraw: function() {
          _this.get('removePoints')(_this);
        }
      },
      drawable: {
        enabled: true
      }
    };
    var sandboxCfg = {
      orientation: 'white',
      movable: {
        free: true,
        color: 'both',
        dropOff: 'trash',
        dests: {},
        events: {
          after: function() {
            console.log();
          }
        }
      },
      animation: {
        enabled: true,
        duration: 200
      },
      premovable: {
        enabled: false
      },
      draggable: {
        showGhost: false
      },
      events: {
        change: function() {
          m.redraw();
          _this.get('sendSandboxPosition')(_this, _this.get('board').getFen(), _this.get('fenData'));
        },
        afterDraw: function() {
          _this.get('addPoints')(_this);
        },
        clearDraw: function() {
          _this.get('removePoints')(_this);
        }
      },
      disableContextMenu: true
    };
    this.set('sandboxCfg', sandboxCfg);
    this.set('reviewCfg', reviewCfg);
    var ground = new Chessground(document.getElementById('board'), reviewCfg);
    this.set('board', ground);

    Ember.$('.other-outter-container').on('click', '.controls a', function() {

      _this.get('whichControl')(_this, Ember.$(this).attr('data-direction'));
    });

    Ember.$('.other-outter-container').on('click', '.move', function(e) {
      e.preventDefault();
      var path = _this.get('readPath')(Ember.$(this).attr('data-path'));
      _this.get('jump')(_this, path);
    });

    Ember.$(document).keydown(function(e) {
      switch(e.which) {
        case 37:
          _this.get('prev')(_this);
        break;

        case 38:
          _this.get('start')(_this);
        break;

        case 39:
          _this.get('next')(_this);
        break;

        case 40:
          _this.get('jump')(_this, [{ ply: _this.get('data').tree.length, variation: null }]);
        break;

        default: return;
      }
      e.preventDefault();
    });

    var util = Chessground.util;
    var drag = Chessground.drag;
    var groundData = this.get('board').dump();

    document.getElementsByClassName('other-outter-container')[0].addEventListener('mousedown', function(e) {
      if (e.button !== 0) {
        return;
      }
      var role = e.target.getAttribute('data-role'),
      color = e.target.getAttribute('data-color');
      if (!role || !color) {
        return;
      }
      e.stopPropagation();
      e.preventDefault();
      var key = _.find(util.allKeys, function(k) {
        return !groundData.pieces[k];
      });
      if(!key) {
        return;
      }
      var coords = util.key2pos(groundData.orientation === 'white' ? key : util.invertKey(key));
      var piece = {
        role: role,
        color: color
      };
      var obj = {};
      obj[key] = piece;
      _this.get('board').setPieces(obj);
      var bounds = document.getElementById("board").getBoundingClientRect();
      var squareBounds = e.target.parentNode.getBoundingClientRect();
      var rel = [
        (coords[0] - 1) * squareBounds.width + bounds.left,
        (8 - coords[1]) * squareBounds.height + bounds.top
      ];
      groundData.draggable.current = {
        orig: key,
        piece: piece.color + ' ' + piece.role,
        rel: rel,
        epos: [e.clientX, e.clientY],
        pos: [e.clientX - rel[0], e.clientY - rel[1]],
        dec: [-squareBounds.width / 2, -squareBounds.height / 2],
        bounds: bounds,
        started: true
      };
      drag.processDrag(groundData);
    });

    Ember.$('.other-outter-container').on('change', '#colorToPlay', function() {
      var clr = Ember.$(this).val();
      _this.get('fenData').toPlay = clr;
    });

    Ember.$('.other-outter-container').on('change', '.castling-controls div input:checkbox', function() {
      var data = _this.get('fenData');
      var $box = Ember.$(this);
      var val = $box.val();
      var attr = $box.data('attr');
      $box.is(':checked') ? data[attr] = val : data[attr] = '';
    });

    Ember.$(document).on('keypress', function(e) {
      var key = e.keyCode || e.which;
      if (e.shiftKey && key === 68) {
        Ember.$('#board').removeClass('cburnett').addClass('duke');
        Ember.$('html').addClass('duke-html');
        Ember.$('body').addClass('duke-body');
        Ember.$('.duke-header').addClass('on');
        Ember.$('#world').addClass('on');
        _this.get('makeConfetti')();
        document.getElementById('audio').play();
        Notify.info({
          raw: "<div>Let's. Go. Duke. 2015 National Champs! <a href='https://www.youtube.com/watch?v=YOFWYCHQkEg' target='_blank'>Duke Blue Devils: 2015 National Champion Tribute</a></div>",
          closeAfter: null
        });
      }
    });

    Ember.$(document).on('keyup', function(e) {
      var key = e.keyCode || e.which;
      if (key === 27) {
        Ember.$('#board').removeClass('duke').addClass('cburnett');
        Ember.$('html').removeClass('duke-html');
        Ember.$('body').removeClass('duke-body');
        Ember.$('.duke-header').removeClass('on');
        Ember.$('#world').removeClass('on');
      }
    });

    Ember.$('.other-outter-container').on('click', '.add-note', function() {
      var $this = Ember.$(this);
      Ember.$("#noteForm h4").text("Add comment to " + $this.attr('san'));
      Ember.$("#notePath").val($this.attr('path'));
      $.modal.defaults = {
        overlay: "transparent",
        opacity: 0,
        zIndex: 1,
        escapeClose: true,
        clickClose: true,
        closeText: 'Close',
        closeClass: '',
        showClose: true,
        modalClass: "modal",
        spinnerHtml: null,
        showSpinner: true,
        fadeDuration: null,
        fadeDelay: 1.0
      }
    });

    window.dataObj = this.get('data');
    window.ground = this.get('board');
  }
});
