#!/usr/bin/env bash

set -e

[ "$DEBUG" == 'true' ] && set -x

# SSH related
#############

DAEMON=sshd

# Copy default config from cache
if [ ! "$(ls -A /etc/ssh)" ]; then
   cp -a /etc/ssh.cache/* /etc/ssh/
fi

# Generate Host keys, if required
if ! ls /etc/ssh/ssh_host_* 1> /dev/null 2>&1; then
    ssh-keygen -A
fi

# Fix permissions, if writable
if [ -w ~/.ssh ]; then
    chown root:root ~/.ssh && chmod 700 ~/.ssh/
fi
if [ -w ~/.ssh/authorized_keys ]; then
    chown root:root ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
fi

# Warn if no config
if [ ! -e ~/.ssh/authorized_keys ]; then
  echo "NOTE: No SSH authorized_keys found for root - SSH will not be available"
fi

# NGINX
echo "radio:$(echo "$NGINX_PASSWORD" | openssl passwd -stdin)" > /radio-stream/data/nginx_passwd
echo "Running nginx..."
nginx

# Beets
#######

# Settings beets default config location per: http://beets.readthedocs.io/en/latest/reference/config.html#environment-variable
echo "PATH=$PATH:/radio-stream/scripts/user:/radio-stream/scripts/bundled" >> /etc/profile
echo "export BEETSDIR=/radio-stream/data/" >> /etc/profile
echo "export EDITOR=vi" >> /etc/profile
source /etc/profile

# SQLite workaround
echo "Preparing SQLite workaround..."
echo "export BEETSDIR=/radio-stream/tmp/" >> /etc/profile
source /etc/profile

mkdir /radio-stream/tmp/
cp /radio-stream/data/library.db /radio-stream/tmp/
cp /radio-stream/data/config.yaml /radio-stream/tmp/

inotifycp /radio-stream/tmp/ /radio-stream/data/ > /radio-stream/log/inotifycp-tmp-data.log &

# CMD
#####
echo "Running: $@"
exec "$@"