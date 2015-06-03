FROM colstrom/node
MAINTAINER Alex Gondek

ADD . /opt/pagerduty-dashboard

WORKDIR /opt/pagerduty-dashboard

RUN npm install \
    && npm install -g gulp \
    && gulp

EXPOSE 3000

ENTRYPOINT ["/usr/bin/node", "app.js"]
