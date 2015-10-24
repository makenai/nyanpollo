#!/bin/bash
/usr/local/bin/node setGPSTime.js
while true
do
  /usr/local/bin/node index.js
done
