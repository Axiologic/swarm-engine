FROM node:12.14.0
RUN npm install -g node-gyp

ENV TARGET_FOLDER_NAME="PSK_NODE"
RUN git clone https://github.com/PrivateSky/privatesky.git $TARGET_FOLDER_NAME

RUN cd $TARGET_FOLDER_NAME && \
    npm install

RUN cd $TARGET_FOLDER_NAME && \
    npm run postinstall

RUN cd $TARGET_FOLDER_NAME && \
    npm run build

RUN chmod 711 $TARGET_FOLDER_NAME/psknode/bin/virtualMq.sh
RUN cd $TARGET_FOLDER_NAME && echo 'node ./psknode/bin/scripts/startZeromqProxy.js & ./psknode/bin/virtualMq.sh --port=8080 --folder="../tmp"' >> startup-script.sh
RUN cd $TARGET_FOLDER_NAME && cat startup-script.sh

EXPOSE 8080/tcp 5000/tcp 5001/tcp

CMD cd $TARGET_FOLDER_NAME && \
    bash startup-script.sh