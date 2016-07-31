FROM vitalybe/radio-stream-base

MAINTAINER Vitaly Belman <vitalyb+dockerfile@gmail.com>

# Nginx
#######

COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Beets
#######

COPY beets /radio-stream/beets

# HACK: Install the dependencies
RUN cd /radio-stream/beets && python setup.py install && pip uninstall -y beets

# Install additional dependencies for plugins :|
RUN pip install flask flask-cors

# beet in PATH
RUN chmod +x /radio-stream/beets/beet && ln -s /radio-stream/beets/beet /usr/local/bin/beet

# Data file
COPY beets_data/config_template.yaml /radio-stream/data/

# Auto execution
################

COPY entry.sh /entry.sh

COPY cmd.sh /cmd.sh

# Expose and run

EXPOSE 80 22

ENTRYPOINT ["/entry.sh"]

CMD ["/cmd.sh"]