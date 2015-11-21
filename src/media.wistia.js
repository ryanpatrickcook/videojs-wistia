/**
 * @fileoverview Wistia Media Controller - Wrapper for Wistia Media API
 */

var WistiaState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3
};

/**
 * Wistia Media Controller - Wrapper for Wistia Media API
 * @param {videojs.Player|Object} player
 * @param {Object=} options
 * @param {Function=} ready
 * @constructor
 */
videojs.Wistia = videojs.MediaTechController.extend({
  init: function(player, options, ready){
    videojs.MediaTechController.call(this, player, options, ready);

    // Copy the JavaScript options if they exists
    if (typeof options['source'] != 'undefined') {
        for (var key in options['source']) {
            player.options()[key] = options['source'][key];
        }
    }

    var protocol = (document.location.protocol === 'file:')?'http:': document.location.protocol;
    this.player_ = player;
    this.player_el_ = document.getElementById(this.player_.id());

    // Disable lockShowing because we always use Wistia controls
    this.player_.controls(false);

    this.id_ = this.player_.id() + '_wistia_api';

    this.script_el_ = videojs.Component.prototype.createEl('script', {
      src: protocol + "//fast.wistia.com/assets/external/E-v1.js"
    });
    this.player_el_.insertBefore(this.script_el_, this.player_el_.firstChild);

    var playerInfo = this.getPlayerInfoFromSrc(this.player_.options()["src"]);

    this.el_ = videojs.Component.prototype.createEl('div', {
      id: this.id_,
      className: playerInfo.classString,
      width: this.player_.options()['width'] || "100%",
      height: this.player_.options()['height'] || "100%"
    });

    this.player_el_.insertBefore(this.el_, this.player_el_.firstChild);

    this.baseUrl = protocol + '//fast.wistia.com/embed/iframe/';

    this.wistiaVideo = {};
    this.wistiaInfo = {};

    var self = this;

    this.script_el_.onload = function() {
      self.wistiaVideo = Wistia.api(self.videoId);
      window._wq = window._wq || [];

      var hash = {};
      hash[self.videoId] = function(video) {
        self.wistiaVideo = video;
        self.onLoad();
      };
      window._wq.push(hash);
    };
  },

  getPlayerInfoFromSrc: function(src) {
    var regExp = /^.*(wistia\.(?:com|net)\/)embed\/iframe\/([\w-]+)/;
    var match = src.match(regExp);
    if(!match) {
      match = src.match(/^.*(wistia\.(?:com|net))\/medias\/([\w-]+)/);
    }
    if(match) {
      this.videoId = match[2];
    }

    var classes = [];
    classes.push("vjs-tech");
    classes.push("wistia_embed");
    classes.push("wistia_async_" + this.videoId);

    var options = {};
    options["wmode"] = "transparent";

    if(src) {
      var playerColorMatch = src.match(/playerColor=([#a-fA-f0-9]+)/);
      if(playerColorMatch)
        this.player_.options()['playerColor'] = playerColorMatch[1];
      var controlsVisibleMatch = src.match(/controlsVisibleOnLoad=(true|false)/);
      if(controlsVisibleMatch)
        this.player_.options()['controls'] = controlsVisibleMatch[1];
      var autoPlayMatch = src.match(/autoplay=(true|false)/);
      if(autoPlayMatch)
        this.player_.options()['autoplay'] = autoPlayMatch[1];
      var volumeMatch = src.match(/volume=([0-9]+)/);
      if(volumeMatch)
        this.player_.options()['volume'] = volumeMatch[1];
      var endVideoBehaviorMatch = src.match(/endVideoBehavior=(loop|default|reset)/);
      if(endVideoBehaviorMatch)
        this.player_.options()['endVideoBehavior'] = endVideoBehaviorMatch[1];
    }

    var color = this.player_.options()['playerColor'];
    if( color && color.substring(0, 1) === '#') {
      this.player_.options()['playerColor'] = color.substring(1);
    }

    if(this.player_.options()['muted'])
      this.player_.options()['volume'] = 0;
    if(this.player_.options()['controls'])
      options["controlsVisibleOnLoad"] = this.player_.options()['controls'];
    if(this.player_.options()['playerColor'])
      options["playerColor"] = this.player_.options()['playerColor'];
    if(this.player_.options()['autoplay'])
      options["autoPlay"] = this.player_.options()['autoplay'];
    if(this.player_.options()['volume'] !== false)
      options["volume"] = this.player_.options()['volume'];
    if(this.player_.options()['loop'])
      this.player_.options()['endVideoBehavior'] = "loop";
    if(this.player_.options()['endVideoBehavior'])
      options["endVideoBehavior"] = this.player_.options()['endVideoBehavior'];

    var keys = Object.keys(options);
    var classString = classes.join(" ") + " ";
    for(var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var value = options[key];
      classString += key + "=" + value + "&";
    }
    classString = classString.replace(/&+$/,'');

    return {
      id: this.videoId,
      classes: classes,
      classString: classString,
      options: options
    };
  }
});

videojs.Wistia.prototype.dispose = function(){
  this.wistiaVideo.remove();
  this.el_.parentNode.removeChild(this.el_);
  videojs.MediaTechController.prototype.dispose.call(this);
};

videojs.Wistia.prototype.src = function(src){
  var playerInfo = this.getPlayerInfoFromSrc(src);
  this.wistiaVideo.replaceWith(playerInfo.id, playerInfo.options);
};

videojs.Wistia.prototype.load = function(){};

videojs.Wistia.prototype.play = function(){
  this.wistiaVideo.play();
};

videojs.Wistia.prototype.pause = function() {
  this.wistiaVideo.pause();
};

videojs.Wistia.prototype.paused = function(){
  return this.wistiaInfo.state !== WistiaState.PLAYING &&
         this.wistiaInfo.state !== WistiaState.BUFFERING;
};

videojs.Wistia.prototype.currentTime = function(){ return this.wistiaInfo.time || 0; };

videojs.Wistia.prototype.setCurrentTime = function(seconds){
  this.wistiaVideo.time(seconds);
  this.player_.trigger('timeupdate');
};

videojs.Wistia.prototype.duration = function(){ return this.wistiaInfo.duration || 0; };
videojs.Wistia.prototype.buffered = function(){ return videojs.createTimeRange(0, (this.wistiaInfo.buffered*this.wistiaInfo.duration) || 0); };

videojs.Wistia.prototype.volume = function() { return (this.wistiaInfo.muted)? this.wistiaInfo.muteVolume : this.wistiaInfo.volume; };
videojs.Wistia.prototype.setVolume = function(percentAsDecimal){
  this.wistiaInfo.volume = percentAsDecimal;
  this.wistiaVideo.volume = percentAsDecimal;
  this.player_.trigger('volumechange');
};
videojs.Wistia.prototype.currentSrc = function() {
  return this.el_.src;
};
videojs.Wistia.prototype.muted = function() { return this.wistiaInfo.muted || false; };
videojs.Wistia.prototype.setMuted = function(muted) {
  if (muted) {
    this.wistiaInfo.muteVolume = this.wistiaInfo.volume;
    this.setVolume(0);
  } else {
    this.setVolume(this.wistiaInfo.muteVolume);
  }

  this.wistiaInfo.muted = muted;
  this.player_.trigger('volumechange');
};

videojs.Wistia.prototype.onReady = function(){
  this.isReady_ = true;
  this.triggerReady();
  this.player_.trigger('loadedmetadata');
};

videojs.Wistia.prototype.onLoad = function(){
  this.wistiaInfo = {
    state: WistiaState.UNSTARTED,
    volume: 1,
    muted: false,
    muteVolume: 1,
    time: 0,
    duration: 0,
    buffered: 0,
    url: this.baseUrl + this.videoId,
    error: null
  };

  var self = this;

  this.wistiaVideo.hasData(function() {
    self.onReady();
  });

  this.wistiaVideo.bind("pause", function() {
    self.onPause();
  });

  this.wistiaVideo.bind("play", function() {
    self.onPlay();
  });

  this.wistiaVideo.bind("seek", function(currentTime, lastTime) {
    self.onSeek({seconds: currentTime});
  });

  this.wistiaVideo.bind("secondchange", function(s) {
    self.wistiaInfo.time = s;
    self.player_.trigger('timeupdate');

    if( self.wistiaVideo.percentWatched() >= 1) {
      self.onFinish();
    }
  });

  this.wistiaVideo.bind("volumechange", function(v) {
    self.setVolume(v);
  });

  this.wistiaVideo.bind("end", function(t) {
    self.onFinish();
  });
};

videojs.Wistia.prototype.onPlay = function(){
  this.wistiaInfo.state = WistiaState.PLAYING;
  this.player_.trigger('play');
};

videojs.Wistia.prototype.onPause = function(){
  this.wistiaInfo.state = WistiaState.PAUSED;
  this.player_.trigger('pause');
};

videojs.Wistia.prototype.onFinish = function(){
  this.wistiaInfo.state = WistiaState.ENDED;
  this.player_.trigger('ended');
};

videojs.Wistia.prototype.onSeek = function(data){
  this.wistiaInfo.time = data.seconds;
  this.wistiaVideo.time(this.wistiaInfo.time);
  this.player_.trigger('timeupdate');
  this.player_.trigger('seeked');
};

videojs.Wistia.prototype.onError = function(error){
  this.player_.error = error;
  this.player_.trigger('error');
};

videojs.Wistia.isSupported = function(){
  return true;
};

videojs.Wistia.prototype.supportsFullScreen = function() {
  return true;
};

videojs.Wistia.canPlaySource = function(srcObj){
  return false;
};

videojs.Wistia.makeQueryString = function(args){
  var array = [];
  for (var key in args){
    if (args.hasOwnProperty(key)){
      array.push(encodeURIComponent(key) + '=' + encodeURIComponent(args[key]));
    }
  }

  return array.join('&');
};