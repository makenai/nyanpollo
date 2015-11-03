#!/bin/bash
# http://stackoverflow.com/questions/5248283/dump-last-frame-of-video-file-using-ffmpeg-mencoder-transcode-et-al
FILENAME=$1
OUTFILE="${2:-$(echo $FILENAME)}"
FFPROBE_OUTPUT=$(ffprobe -show_streams $FILENAME 2>&1)
FRAME_COUNT=$(echo $FFPROBE_OUTPUT | sed 's/.*nb_frames=\([0-9]*\).*/\1/g')
LAST_FRAME=$(expr $FRAME_COUNT - 1)
ffmpeg -y -loglevel error -i $FILENAME -vf "select='eq(n,1)'" -vframes 1 $OUTFILE-first.png
ffmpeg -y -loglevel error -i $FILENAME -vf "select='eq(n,$LAST_FRAME)'" -vframes 1 $OUTFILE-last.png