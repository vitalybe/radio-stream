#!/usr/bin/env bash
set -e
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
docker build -t vitalybe/radio-stream-base:latest docker_radio_stream_base
docker build -t vitalybe/radio-stream:latest .