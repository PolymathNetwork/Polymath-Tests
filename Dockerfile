FROM mongo:4.1-xenial
LABEL maintainer="josepmc <jmateu.clemente@gmail.com>"

ENV DEBIAN_FRONTEND noninteractive
ENV DEBCONF_NONINTERACTIVE_SEEN true
RUN apt-get update && apt-get install -y wget curl
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' | tee /etc/apt/sources.list.d/google-chrome.list
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get update && \
    apt-get install -y nodejs xvfb supervisor default-jdk \
    build-essential git firefox google-chrome-stable ffmpeg x11vnc ssh
RUN npm i -g yarn
ENV DISPLAY :99
RUN mkdir -p /mongodb_data && mkdir -p /var/log/supervisord
ENV NO_APP false
RUN printf \
'[supervisord]\n\
nodaemon=true\n\
childlogdir=/var/log/supervisord\n\
[program:xvfb]\n\
command=Xvfb :99 -screen 0 1920x1080x24+32\n\
[program:x11vnc]\n\
command=x11vnc -display :99\n\
[program:apps]\n\
command=bash -c "if [ \"%%(ENV_NO_APP)s\" != \"true\" ]; then yarn setup --apps; fi"\n\
directory=/tests\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n\
startretries=1\n\
stopsignal=INT\n\
[program:sshd]\n\
command=/usr/sbin/sshd -D\n\
[program:mongodb]\n\
command=/usr/bin/mongod\n\
user=root'\
> /etc/supervisor/conf.d/supervisord.conf

RUN mkdir /var/run/sshd
RUN echo 'root:test' | chpasswd
RUN sed -i 's/PermitRootLogin without-password/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd
RUN echo '127.0.0.1 local' >> /etc/hosts
# Tests directory, app should be inside
VOLUME /tests
WORKDIR /tests
# SSH
EXPOSE 22
# VNC
EXPOSE 5900
# Web servers
EXPOSE 3000-3002
# Ganache
EXPOSE 8545
ENTRYPOINT [ "/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf" ]
