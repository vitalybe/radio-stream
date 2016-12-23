#!/usr/bin/env bash

# beets
#######

echo "Running radio-stream..."
beet radio &

echo "******************************************************************"
echo " Radio Stream server is up and listening on: http://localhost:80"
echo " User: radio"
echo " Pass: $NGINX_PASSWORD"
echo "******************************************************************"
echo ""

# SSH server
############

DAEMON=sshd

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

echo "Running sshd"
trap stop SIGINT SIGTERM
/usr/sbin/sshd -D -f /etc/ssh/sshd_config &
pid="$!"
mkdir -p /var/run/$DAEMON && echo "${pid}" > /var/run/$DAEMON/$DAEMON.pid
wait "${pid}" && exit $?
