FROM mongo:4.1-xenial
LABEL maintainer="josepmc <jmateu.clemente@gmail.com>"

ENV DEBIAN_FRONTEND noninteractive
ENV DEBCONF_NONINTERACTIVE_SEEN true
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' | tee /etc/apt/sources.list.d/google-chrome.list
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get update && \
    apt-get install -y nodejs xvfb supervisor openjdk-11-jdk \
    build-essential git firefox-esr google-chrome-stable
RUN npm i -g yarn
ENV DISPLAY :99
ARG startApps=true
RUN printf \
"[supervisord]\n\
nodaemon=true\n\
childlogdir=/var/log/supervisord\n\
[program:xvfb]\n\
command=Xvfb :99 -screen 0 1920x1080x24+32\n\
[program:x11vnc]\n\
command=x11vnc -display :99\n\
[program:apps]\n\
command=node setup.js --params.setup.apps\n\
directory=/tests\n\
autostart=${startApps}\n\
[program:mongodb]\n\
command=/opt/mongodb/bin/mongod --dbpath /storage/mongodb_data --rest\n\
directory=/opt/mongodb\n\
user=root"\
> /etc/supervisor/conf.d/supervisord.conf

# Tests directory, app should be inside
VOLUME /tests
WORKDIR /tests
# VNC
EXPOSE 5900
# Web servers
EXPOSE 3000-3002
# Ganache
EXPOSE 8545
CMD [ "/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf" ]