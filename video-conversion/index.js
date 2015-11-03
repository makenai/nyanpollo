'use strict';
var fs = require('fs'),
  async = require('async'),
  ms = require('ms'),
  ffmpeg = require('ffmpeg'),
  exec = require('child_process').exec;

var concatFile = '/Users/pawel/Desktop/nyanpollo/concat.txt';
var videoPath = '/Users/pawel/Desktop/nyanpollo/mp4-test/';
var framePath = '/Users/pawel/Desktop/nyanpollo/frames/';
var fillerPath = '/Users/pawel/Desktop/nyanpollo/filler/';
var videoFiles = fs.readdirSync(videoPath).filter(function(x) {
  return x.match(/\.mp4$/);
}).sort();
var videoTimes = calculateVideoTimes( videoFiles );

// https://trac.ffmpeg.org/wiki/Concatenate
var concatStream = fs.createWriteStream(concatFile);
concatStream.once('open', function(fd) {

  concatStream.write("# ffmpeg -f concat -i concat.txt -c copy full-video.mp4\n");

  // First, extract all the frames
  async.eachSeries(videoFiles, function(videoFile, done) {
    var command = [
      './extractFrames.sh',
      '"' + videoPath + videoFile + '"',
      '"' + framePath + videoFile + '"'
    ].join(' ');
    var child = exec(command, function (error, stdout, stderr) {
      if (error) { console.log( error ); }
      console.log('Extracted frames from ' + videoFile);
      done();
    });
  }, function() {
    console.log("Done Extracting Frames\n");

    // Then generate filler movies
    async.eachSeries(videoFiles, function(videoFile, done) {
      console.log('Analyzing ' + videoFile);
      new ffmpeg(videoPath + videoFile, function (err, video) {
        if (err) { return console.log('Error: ' + err); }
        var videoDuration = hhmmssToMs( video.metadata.duration.raw.split(':') );
        if ( videoTimes[ videoFile ].nextFile ) {
          var fillerTime = videoTimes[ videoFile ].delta - videoDuration;
          var duration = (fillerTime / 1000);
          console.log('' + duration + ' seconds missing...');
          var command = [
            './createFillerMovie.sh',
            '"' + framePath + videoFile + '-last.png"',
            '"' + framePath + videoTimes[ videoFile ].nextFile + '-first.png"',
            duration,
            '"' + fillerPath + videoFile + '-filler.mp4"'
          ].join(' ');
          var child = exec(command, function (error, stdout, stderr) {
            if (error) { console.log( error ); }
            console.log("Created " + videoFile + '-filler.mp4');
            concatStream.write("file '" + videoPath + videoFile + "'\n");
            concatStream.write("file '" + fillerPath + videoFile + "-filler.mp4'\n");
            done();
          });
        } else {
          // This is the last video.
          concatStream.write("file '" + videoPath + videoFile + "'\n");
          done();
        }
      });
    }, function() {
      concatStream.end();
    });
  });
});

function calculateVideoTimes( videoFiles ) {
  var videoTimes = {};
  for (var i=0;i<videoFiles.length;i++) {
    var thisFile = videoFiles[ i ];
    var nextFile = videoFiles[ i + 1 ];
    var data = {
      startTime: getStartTimeFromFilename( thisFile )
    };
    if ( nextFile ) {
      data.nextStartTime = getStartTimeFromFilename( nextFile );
      data.delta = data.nextStartTime - data.startTime;
      data.nextFile = nextFile;
    }
    videoTimes[ thisFile ] = data;
  }
  return videoTimes;
};

function getStartTimeFromFilename( filename ) {
  var filenameTimestamp = filename.match(/T(\d{2})_(\d{2})_(\d{2})\./);
  return hhmmssToMs([ filenameTimestamp[1], filenameTimestamp[2], filenameTimestamp[3] ]);
};

function hhmmssToMs( hhmmss ) {
  return Math.round(
    (parseFloat(hhmmss[0]) * 60 * 60 * 1000) +
    (parseFloat(hhmmss[1]) * 60 * 1000) +
    (parseFloat(hhmmss[2]) * 1000)
  );
}

