FROM python:2.7-alpine

MAINTAINER Vitaly Belman <vitalyb+dockerfile@gmail.com>

# Instal NGINX
RUN echo "http://dl-4.alpinelinux.org/alpine/v3.3/main" >> /etc/apk/repositories && \
    apk add --update nginx=1.8.1-r1 && \
    rm -rf /var/cache/apk/* && \
    chown -R nginx:www-data /var/lib/nginx

# Install SSH
RUN apk update && \
    apk add openssh bash && \
    mkdir -p ~root/.ssh && chmod 700 ~root/.ssh/ && \
    echo -e "Port 22\n" >> /etc/ssh/sshd_config && \
    cp -a /etc/ssh /etc/ssh.cache && \
    rm -rf /var/cache/apk/*

COPY entry.sh /entry.sh

# Set beets as startup folder (for SSH)
# For local execution do: docker run -w /root/beets ... /bin/sh 
RUN mkdir /root/beets && echo "cd /root/beets" >> /etc/profile

# Expose and run

EXPOSE 80 22

ENTRYPOINT ["/entry.sh"]

CMD ["/usr/sbin/sshd", "-D", "-f", "/etc/ssh/sshd_config"]