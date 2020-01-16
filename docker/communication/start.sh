#!/bin/bash
name="$(./util/name.sh -1)"

docker run --detach \
    --hostname psk_comm_host \
    --publish 5000:5000 \
    --publish 5001:5001 \
    --publish 8080:8080 \
    --name $name \
    --restart always \
    privatesky/virtualmq
