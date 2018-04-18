#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
$DIR/cli/bin/server/stop
docker build -t helpse/radio-stream:latest .
