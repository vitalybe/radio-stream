FROM python:2.7-alpine

MAINTAINER Vitaly Belman <vitalyb+dockerfile@gmail.com>

# Add repositories and update
RUN echo "http://dl-4.alpinelinux.org/alpine/v3.3/main" >> /etc/apk/repositories && \
    apk update

# Instal NGINX
RUN apk add nginx=1.8.1-r1 && \
    chown -R nginx:www-data /var/lib/nginx

# Install SSH
RUN apk add openssh bash ca-certificates && \
    mkdir -p ~root/.ssh && chmod 700 ~root/.ssh/ && \
    echo -e "Port 22\n" >> /etc/ssh/sshd_config && \
    cp -a /etc/ssh /etc/ssh.cache

# Various useful linux utilities
RUN apk add util-linux ffmpeg

# Useful pip utilities
RUN pip install youtube_dl

# Clear APK cache
RUN rm -rf /var/cache/apk/*
