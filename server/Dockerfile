FROM python:2.7-alpine

MAINTAINER Vitaly Belman <vitalyb+dockerfile@gmail.com>

# Infra
#######

# Add repositories and update
RUN echo "http://dl-4.alpinelinux.org/alpine/v3.3/main" >> /etc/apk/repositories && \
    apk update

# Instal NGINX
RUN apk add nginx=1.8.1-r1 && \
    chown -R nginx:www-data /var/lib/nginx

# Install SSH
RUN apk add openssh openssl bash ca-certificates && \
    mkdir -p ~root/.ssh && chmod 700 ~root/.ssh/ && \
    echo -e "Port 22\n" >> /etc/ssh/sshd_config && \
    cp -a /etc/ssh /etc/ssh.cache

# Various useful linux utilities
RUN apk add util-linux ffmpeg

# Useful pip utilities
RUN pip install youtube_dl

# Clear APK cache
RUN rm -rf /var/cache/apk/*

# Beets
#######

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

# Nginx
#######

COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Auto execution
################

COPY scripts/entry.sh /entry.sh

COPY scripts/cmd.sh /cmd.sh

# Expose and run

EXPOSE 80 22

ENTRYPOINT ["/entry.sh"]

CMD ["/cmd.sh"]
