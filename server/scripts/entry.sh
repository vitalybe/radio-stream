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

# needed for beet to know its library location
source /root/.bashrc

# CMD
#####
echo "Running: $@"
exec "$@"