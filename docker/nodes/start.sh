#!/bin/bash
name="$(./util/name.sh -1)"

docker run --detach \
    --hostname localhost \
    --name $name \
    --restart always \
    privatesky/psk_node
