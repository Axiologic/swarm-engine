#!/bin/bash
name="$(./util/name.sh -1)"

docker run --detach \
    --hostname localhost \
    --publish 15000:5000 \
    --publish 15001:5001 \
    --publish 18080:8080 \
    --name $name \
    --restart always \
    privatesky/comm_node
