Prerequirements
===============

1. `yarn install`
1. `brew install pidcat`

Build
=====
Run: `./build_dockerfile.sh`

Publish
=======

If you have the permission you can publish directly by running: 

`docker push vitalybe/radio-stream:latest`

Running
=======
See [here](https://github.com/vitalybe/radio-stream-cli/)

Development
===========

Connect to a server running radio-stream backend and run in development mode by adding `-d` parameter to regular cli running, like so:

`./cli/bin/server/start -d /radio-stream/beets/beet radio -d`