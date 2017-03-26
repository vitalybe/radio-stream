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

To run in development mode add `-d` parameter to regular cli running, like so:

`./cli/bin/server/start -d sh`

This will use `./beets` as source folder instead of using a prebuilt docker image. This will allow you to modify the files of beets directly instead of using docker image.

Additionally if you run the radio, in the container, with a `-d` it will autoreload the flak application on every change, so you won't need to relaunch it everytime: 

`/radio-stream/beets/beet radio -d`

TIP: If working locally with PyCharm and the server is located on a remote server, you can set PyCharm to auto-upload every change automaitcally. This will allow you to work locally and still have all the music and database available
