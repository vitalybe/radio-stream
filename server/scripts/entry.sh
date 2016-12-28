#!/usr/bin/env bash

set -e

[ "$DEBUG" == 'true' ] && set -x

# NGINX
#######

mkdir /radio-stream/data/nginx/
echo "radio:$(echo "$NGINX_PASSWORD" | openssl passwd -stdin)" > /radio-stream/data/nginx/nginx_passwd
echo "Running nginx..."
nginx

# Beets
#######

# Merge configuration
merge_yaml /radio-stream/config/config_source.yaml /radio-stream/config/config_user.yaml /radio-stream/data/beets/config.yaml

# Settings beets default config location per: http://beets.readthedocs.io/en/latest/reference/config.html#environment-variable
echo "PATH=$PATH:/radio-stream/scripts/user:/radio-stream/scripts/bundled" >> /root/.bashrc
echo "export BEETSDIR=/radio-stream/data/beets/" >> /root/.bashrc
echo "export EDITOR=vi" >> /root/.bashrc
source /root/.bashrc

# CMD
#####
echo "Running: $@"
exec "$@"