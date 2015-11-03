'use strict';
var fs = require('fs'),
  async = require('async'),
  ms = require('ms'),
  ffmpeg = require('ffmpeg'),
  moment = require('moment'),
  jsonfile = require('jsonfile'),
  exec = require('child_process').exec;

var adjustmentFile = '/Users/pawel/Desktop/nyanpollo/timeAdjustments.json';
var concatFile = '/Users/pawel/Desktop/nyanpollo/concat-compressed.txt';
var videoPath = '/Users/pawel/Desktop/nyanpollo/mp4/';
var framePath = '/Users/pawel/Desktop/nyanpollo/frames/';
var fillerPath = '/Users/pawel/Desktop/nyanpollo/filler/';
var videoFiles = fs.readdirSync(videoPath).filter(function(x) {
  return x.match(/\.mp4$/);
}).sort();
var videoTimes = calculateVideoTimes( videoFiles );
var adjustments = [];
var runningDuration = 0;

// https://trac.ffmpeg.org/wiki/Concatenate
var concatStream = fs.createWriteStream(concatFile);
concatStream.once('open', function(fd) {
  concatStream.write("# ffmpeg -f concat -i concat-compressed.txt -c copy full-video.mp4\n");
  // Then generate filler movies
  async.eachSeries(videoFiles, function(videoFile, done) {
    console.log('Analyzing ' + videoFile);
    new ffmpeg(videoPath + videoFile, function (err, video) {
      if (err) { return console.log('Error: ' + err); }
      var videoDuration = hhmmssToMs( video.metadata.duration.raw.split(':') );
      var realTime = getRealTimeFromFilename( videoFile );
      adjustments.push({
        duration: ms( runningDuration ),
        videoTime: runningDuration,
        timestamp: realTime.valueOf(),
        date: realTime.utc().format()
      });
      runningDuration = runningDuration + videoDuration;
      concatStream.write("file '" + videoPath + videoFile + "'\n");
      done();
    });
  }, function() {
    jsonfile.writeFile(adjustmentFile, adjustments, function (err) {
      if (err) { console.error(err) };
    });
    concatStream.end();
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

function getRealTimeFromFilename( filename ) {
  // nyanpollo-2015-10-24T21_55_42.883Z.h264
  var timestampPart = filename.match(/(\d{4}-\d{2}-\d{2}T[\d_.]+Z)/);
  return moment( timestampPart[1].replace(/_/g, ':') );
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

