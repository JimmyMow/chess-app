import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['EmberYoutube'],
  ytid: null,
  player: null,
  playerState: 'loading',
  isMuted: false,
  volume: 100,
  showControls: false,
  showTime: false,
  showProgress: false,
  showDebug: false,
  autoplay: 0,

  playerVars: {
    autoplay: 0,
    controls: 1,
    enablejsapi: 1,
    rel: 0, // disable related videos
    showinfo: 0,
    autohide: 1,
    fs: 0, // disable fullscreen button
    playsinline: 1
  },

  youtubeInit: function() {
    console.log("here on init");
    var _this = this;
    if(this.get('iframeId') === 'accountVideo') {
      window.imtryingaccount = function() {
        return _this.createPlayer();
      };
    } else {
      window.imtryingroom = function() {
        return _this.createPlayer();
      };
    }
    // YouTube callback when API is ready
    window.onYouTubeIframeAPIReady = function() {
      console.log("here at iframeApi callback");
      window.imtryingaccount();
      window.imtryingroom();
    }.bind(this);

    var tag = document.createElement('script');
    var firstTag = document.getElementsByTagName('script')[0];

    tag.src = "https://www.youtube.com/iframe_api";
    firstTag.parentNode.insertBefore(tag, firstTag);
  }.on('init'),

  createPlayer: function() {
    console.log("here with: ", this.get('iframeId'));
    var _this = this;
    var playerVars = this.get('playerVars');
    var $iframe = this.$('#' + this.get('iframeId'));

    var player = new YT.Player($iframe[0], {
      width: 360,
      height: 270,
      playerVars: playerVars,
      events: {
        'onReady': _this.onPlayerReady.bind(_this),
        'onStateChange': _this.onPlayerStateChange.bind(_this),
        'onError': _this.onPlayerError.bind(_this)
      }
    });

    this.set('player', player);
  },

  onPlayerReady: function() {
    this.set('playerState', 'ready');
    this.loadVideo();
  },

  onPlayerStateChange: function(event) {
    // Get a readable state name
    var state = this.get('stateNames.' + event.data.toString());
    this.set('playerState', state);

    if (this.get('showDebug')) { debug(state); }

    // send actions outside
    this.sendAction(state);

    // send actions inside
    this.send(state);
  },

  onPlayerError: function(event) {
    var errorCode = event.data;
    this.set('playerState', 'error');

    Ember.warn('error' + errorCode);

    // Send the event to the controller
    this.sendAction('error', errorCode);
  },

  loadVideo: function() {
    var id = this.get('ytid');
    var player = this.get('player');

    // make sure we have access to the functions we need
    // otherwise the player might die
    if (!id || !player.loadVideoById || !player.cueVideoById) {
      if (this.get('showDebug')) { debug('no id'); }
      return;
    }

    if (this.playerVars.autoplay) {
      player.loadVideoById(id);
    } else {
      player.cueVideoById(id);
    }
  }.observes('ytid'),

  actions: {
    load: function() { this.get('player').loadVideo(); },
    play: function() { this.get('player').playVideo(); },
    pause: function() { this.get('player').pauseVideo(); },
    mute: function() { this.get('player').mute(); },
    unMute: function() { this.get('player').unMute(); },
    togglePlay: function() {
      if (this.get('isPlaying')) {
        this.send('pause');
      } else {
        this.send('play');
      }
    },
    toggleVolume: function() {
      var player = this.get('player');
      this.toggleProperty('isMuted');
      if (player.isMuted()) {
        this.send('unMute');
      } else {
        this.send('mute');
      }
    },
    seekTo(ms) {
      this.get('player').seekTo(ms);
    },

    // youtube events
    ready: function() {},
    ended: function() {},
    playing: function() {
      this.startTimer();
    },
    paused: function() {
      this.stopTimer();
    },
    buffering: function() {},
    queued: function() {},
  }
});
