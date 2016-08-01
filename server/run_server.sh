#!/usr/bin/env bash
SSH_PUB=~/.ssh/id_rsa.pub
DATA=~/Dropbox/Application\ Settings/beets_data
MUSIC=~/Dropbox/Projects/music-stream/server/beets/test/rsrc

docker run -it -p 80:80  -p 2222:22\
    -v "$SSH_PUB":/root/.ssh/authorized_keys:ro\
	-v "$DATA":/radio-stream/data\
	-v "$MUSIC":/radio-stream/music\
	vitalybe/radio-stream $*
