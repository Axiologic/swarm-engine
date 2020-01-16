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

RUN cd $TARGET_FOLDER_NAME && \
    rm -rf conf && \
    cd bin/scripts && \
    sed -i 's/127.0.0.1/localhost/g' generateConfig.js && \
    node generateConfig.js

RUN cd $TARGET_FOLDER_NAME && echo 'node ./psknode/core/launcher.js' >> startup-script.sh
RUN cd $TARGET_FOLDER_NAME && cat startup-script.sh

CMD cd $TARGET_FOLDER_NAME && \
    bash startup-script.sh