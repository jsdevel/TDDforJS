#!/bin/bash
BIN_DIR=$(dirname $(readlink -f ${BASH_SOURCE[0]}));
PROJECT_DIR=$(dirname $BIN_DIR);

cd $PROJECT_DIR;

function buildThenTest(){
   clear;
   $(npm bin)/xforjs > /dev/null;
   node $BIN_DIR/build.js;
   node $PROJECT_DIR/build/TDDforJS.js;
}
buildThenTest;

while RESULT=$(inotifywait -qr -e MODIFY --exclude .*\\.swp $PROJECT_DIR)
do
   buildThenTest;
done
