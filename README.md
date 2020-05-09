# Video.js - Wistia Source Support
Allows you to use Wistia URL as source with [Video.js](https://github.com/videojs/video-js/).

[Video.js 5 Example](http://ryanpatrickcook.github.io/videojs-wistia/) |
[Video.js 4 Example](http://ryanpatrickcook.github.io/videojs-wistia/index-vjs4.html)

## How does it work?
Including the script vjs.wistia.js will add the Wistia as a tech. You just have to add it to your techOrder option. [Wistia Javascript Player API docs](http://wistia.com/doc/player-api).

Here is an example of how to use with Javascript events:

videojs("main-player", {
    techOrder: ["wistia"],
    sources: [{
      type: "video/wistia",
      src: "http://home.wistia.com/medias/mgj008fjp0?&playerColor=B66537",
    }, ],
  }).ready(function () {
    this.on("pause", function () {
      document.body.style.backgroundColor = "#ffcccc";
      console.log("video.js - pause");
    });

    this.on("play", function () {
      document.body.style.backgroundColor = "#eafeea";
      console.log("video.js - play");
    });

    this.on("seeked", function () {
      console.log("video.js - seeked");
    });

    this.on("volumechange", function () {
      console.log("video.js - volumechange");
    });

    this.on("ended", function () {
      console.log("video.js - ended");
      this.src({
        type: "video/wistia",
        src: "http://home.wistia.com/medias/o54ad5d0t5?&playerColor=B66537",
      });
      this.play();
    });
  });

If you're using video.js 4 (use the `video-js-4` branch) - Javascript events

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


## Supported URLs
http://fast.wistia.com/embed/iframe/:id

http://home.wistia.com/medias/:id
