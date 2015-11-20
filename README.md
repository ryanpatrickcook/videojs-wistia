# Video.js - Wistia Source Support
Allows you to use Wistia URL as source with [Video.js](https://github.com/zencoder/video-js/).

## How does it work?
Including the script vjs.wistia.js will add the Wistia as a tech. You just have to add it to your techOrder option. [Wistia Javascript Player API docs](http://wistia.com/doc/player-api).

Here is an example of how to use with Javascript events:

    videojs('videoId', {
      "techOrder": ["wistia"],
      "src": "http://fast.wistia.com/embed/iframe/b0767e8ebb"
    }).ready(function() {
      this.on('pause', function() {
        console.log("video.js - pause");
      });

      this.on('play', function() {
        console.log("video.js - play");
      });

      this.on('seeked', function() {
        console.log("video.js - seeked");
      });

      this.on('volumechange', function() {
        console.log("video.js - volumechange");
      });
    });