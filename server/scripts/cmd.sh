#!/usr/bin/env bash

DAEMON=radio-stream

stop() {
    echo "Received SIGINT or SIGTERM. Shutting down $DAEMON"
    # Get PID
    pid=$(cat /var/run/$DAEMON/$DAEMON.pid)
    # Set TERM
    kill -SIGTERM "${pid}"
    # Wait for exit
    wait "${pid}"
    # All done.
    echo "Done."
}

# needed for beet to know its library location
source /root/.bashrc

echo "Running radio-stream..."
trap stop SIGINT SIGTERM
beet radio &
pid="$!"
mkdir -p /var/run/$DAEMON && echo "${pid}" > /var/run/$DAEMON/$DAEMON.pid

wait "${pid}" && exit $?