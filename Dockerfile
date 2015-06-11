FROM colstrom/node
MAINTAINER Alex Gondek

ADD . /opt/pagerduty-dashboard

WORKDIR /opt/pagerduty-dashboard

RUN npm install \
    && npm install -g gulp \
    && gulp \
    && cp config.sample.json config.json

EXPOSE 3000

ENTRYPOINT ["/usr/bin/node", "app.js"]
