#!/usr/bin/env bash
SSH_PUB=~/Dropbox/Application\ Settings/radio-stream/ssh-key/authorized_keys
DATA=~/Dropbox/Application\ Settings/radio-stream/beets-data
MUSIC=~/Dropbox/Projects/music-stream/server/beets/test/rsrc

docker run -it -p 80:80  -p 22123:22\
    -v "$SSH_PUB":/root/.ssh/authorized_keys:ro\
	-v "$DATA":/radio-stream/data\
	-v "$MUSIC":/radio-stream/music\
	vitalybe/radio-stream $*
