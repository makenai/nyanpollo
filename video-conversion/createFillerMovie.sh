#!/bin/bash
FILE1=$1
FILE2=$2
DURATION=$3
OUTFILE=$4
CAPTION="$DURATION seconds missing..."

# http://www.imagemagick.org/Usage/annotating/
rm -f /tmp/first-frame.png
convert $FILE1 -gravity center \
  -pointsize 36 \
  -stroke '#000C' -strokewidth 2 -annotate 0 "$CAPTION" \
  -stroke  none   -fill white    -annotate 0 "$CAPTION" \
  /tmp/first-frame.png

rm -f /tmp/last-frame.png
convert $FILE2 -gravity center \
  -pointsize 36 \
  -stroke '#000C' -strokewidth 2 -annotate 0 "$CAPTION" \
  -stroke  none   -fill white    -annotate 0 "$CAPTION" \
  /tmp/last-frame.png

# http://stackoverflow.com/questions/21493797/how-to-fade-two-images-with-ffmpeg
# http://stackoverflow.com/questions/14430593/encoding-a-readable-movie-by-quicktime-using-ffmpeg
ffmpeg -loop 1 -i /tmp/first-frame.png \
  -loop 1 -i /tmp/last-frame.png \
  -filter_complex "[1:v][0:v]blend=all_expr='A*(if(gte(T,$DURATION),1,T/$DURATION))+B*(1-(if(gte(T,$DURATION),1,T/$DURATION)))'" \
  -t $DURATION -y -r 30 -vcodec libx264 -pix_fmt yuv420p \
  $OUTFILE