#!/bin/bash
BIN_DIR=$(dirname $(readlink -f ${BASH_SOURCE[0]}));
PROJECT_DIR=$(dirname $BIN_DIR);

cd $PROJECT_DIR;
clear;
npm test;

while RESULT=$(inotifywait -qr -e MODIFY --exclude .*\\.swp $PROJECT_DIR)
do
   clear;
   npm test;
done
