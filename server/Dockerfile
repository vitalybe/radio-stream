FROM vitalybe/radio-stream-base

MAINTAINER Vitaly Belman <vitalyb+dockerfile@gmail.com>

# Beets
#######

COPY beets /radio-stream/beets

# HACK: Install the dependencies
RUN cd /radio-stream/beets && pip install -e .

# Install additional dependencies for plugins :|
# Per https://github.com/beetbox/beets/issues/2136
RUN pip install flask flask-cors

# Configuration merging
RUN pip install hiyapyco
COPY scripts/merge_yaml.py /usr/local/bin/merge_yaml

# Nginx
#######

COPY nginx/nginx.conf /etc/nginx/nginx.conf

# SQLite workaround
###################

RUN pip install pyinotify
COPY scripts/inotifycp.py /usr/local/bin/inotifycp
RUN chmod +x /usr/local/bin/inotifycp
RUN mkdir /radio-stream/log

# Auto execution
################

COPY scripts/entry.sh /entry.sh

COPY scripts/cmd.sh /cmd.sh

# Expose and run

EXPOSE 80 22

ENTRYPOINT ["/entry.sh"]

CMD ["/cmd.sh"]