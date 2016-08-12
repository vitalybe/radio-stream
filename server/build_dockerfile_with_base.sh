#!/usr/bin/env bash
set -e
docker build -t vitalybe/radio-stream-base:latest docker_radio_stream_base
docker build -t vitalybe/radio-stream:latest .