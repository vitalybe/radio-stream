#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

SSH_PUB=~/Dropbox/Application\ Settings/radio-stream/ssh-key/authorized_keys
DATA=$DIR/beets-data
MUSIC=$DIR/music
NEW_MUSIC=$DIR/new-music

docker run -it -p 80:80  -p 22123:22\
    -v "$SSH_PUB":/root/.ssh/authorized_keys:ro\
	-v "$DATA":/radio-stream/data\
	-v "$MUSIC":/radio-stream/music\
	-v "$NEW_MUSIC":/radio-stream/new-music\
	vitalybe/radio-stream $*
