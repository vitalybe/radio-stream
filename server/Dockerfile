FROM python:2.7-alpine

MAINTAINER Vitaly Belman <vitalyb+dockerfile@gmail.com>

# Infra
#######

# Add repositories and update
RUN echo "http://dl-4.alpinelinux.org/alpine/v3.3/main" >> /etc/apk/repositories && \
    apk update

# Instal NGINX
RUN apk add nginx && \
    chown -R nginx:www-data /var/lib/nginx

# Various useful linux utilities
RUN apk add util-linux ffmpeg bash openssl coreutils vim

# Useful pip utilities
RUN pip install youtube_dl

# Clear APK cache
RUN rm -rf /var/cache/apk/*

# Beets
#######

# Actual (modified) beets code
COPY beets /radio-stream/beets

# HACK: Install the dependencies
RUN cd /radio-stream/beets && pip install -e .

# Install additional dependencies for plugins :|
# Per https://github.com/beetbox/beets/issues/2136
RUN pip install flask flask-cors pylast

# Configuration merging
RUN pip install hiyapyco
COPY scripts/merge_yaml.py /usr/local/bin/merge_yaml
RUN chmod +x /usr/local/bin/merge_yaml

# Replace beet launcher with my own version - I can't seem to use the original one in dev (-d) mode of bin/server/start
RUN ln -s -f /radio-stream/beets/beet /usr/local/bin/beet

# Nginx
#######

RUN mkdir -p /run/nginx
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Auto execution
################

COPY scripts/.bashrc /root/.bashrc

COPY scripts/entry.sh /entry.sh

COPY scripts/cmd.sh /cmd.sh

# Expose and run

EXPOSE 80 22

ENTRYPOINT ["/entry.sh"]

CMD ["/cmd.sh"]
