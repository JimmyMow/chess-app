import Ember from 'ember';
import InboundActions from 'ember-component-inbound-actions/inbound-actions';

export default Ember.Component.extend(InboundActions, {
  tag: 'div',
  classNames: ['chess-board'],
  board: null,
  game: null,
  data: null,
  variationActive: false,
  emptyMove: m('em.move.empty', '...'),
  sparePiece: null,
  actions: {
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
    },

    startPos: function() {
      var chess = this.get('game');
      var chessground = this.get('board');
      var data = this.get('data');
      chess.reset();
      chessground.set({
        fen: 'start',
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
      this.get('displayTree')(this);
      Ember.$('#pgnUpload').val('');
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
  //////////////////////////
  //chess logic functions//
  /////////////////////////
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
        null, move.san
      ]
    };
  },
  renderMeta: function(component, move, path) {
    if (!move || !move.variations.length) {
      return;
    }
    var children = [];
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
    if (!move || !move.variations.length) {
      return;
    }
    return move.variations.map(function(variation, i) {
      return component.get('renderVariationNested')(component, variation, component.get('withVariation')(component, path, i + 1));
    });
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
  ////////////////////////////
  // element ready function //
  ////////////////////////////
  didInsertElement: function() {
    var _this = this;
    var chess = new Chess();
    this.set('game', chess);
    var onMove = function(from, to) {
      var chess = _this.get('game');
      var castle = _this.get('didTheyCastle')(from+"-"+to);
      if(castle) {
        _this.get('board').move(castle.from, castle.to);
        _this.get('board').set({
          lastMove: [from, to]
        });
      }
      var move = chess.move({from: from, to: to});
      chess.move({from: from, to: to});
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
    var ground = new Chessground(document.getElementById('board'), {
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
        dests: _this.get('chessToDests')(chess),
        events: {
          after: onMove
        }
      }
    });
    this.set('board', ground);

    Ember.$('.controls a').on('click', function() {
      _this.get('whichControl')(_this, Ember.$(this).attr('data-direction'));
    });

    Ember.$('.pgn').on('click', '.move', function(e) {
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
  }
});
