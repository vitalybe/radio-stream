Build
=====

Run: `./build_dockerfile.sh`

Publish
=======

If you have the permission you can publish directly by running: 

`docker push vitalybe/radio-stream:latest`

Running
=======

See (file)[cli/README.md]

Development
===========

To run in development mode add `-d` parameter to regular cli running, like so:

`./run_server.sh -d sh`

Then once in the container shell, write:

`/radio-stream/beets/beet radio`

NOTE: For some reason `beet` command does not work in dev mode 