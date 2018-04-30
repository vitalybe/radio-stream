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

`./cli/bin/server/start -d -p this /radio-stream/beets/beet -v radio -d`

Now you can modify beet files on the server and it will automatically reload. To work in IDE mount the remote server locally.

Mounting
--------

To mount the server folder in OSX do:

```
brew cask install osxfuse
brew install sshfs
mkdir /tmp/droplet-mnt
sudo sshfs -o allow_other,defer_permissions,IdentityFile=~/.ssh/id_rsa root@138.68.72.243:/root/radio-stream/server /tmp/droplet-mnt-radio-stream
```

Now you can use local IDE to open the folder (note - It will be a bit slow)

Once done, you can unmount like so:

`umount /tmp/droplet-mnt-radio-stream`
