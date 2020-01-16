#!/bin/bash
name="$(./util/name.sh -1)"

docker run --detach \
    --hostname psk_node_host \
    --name $name \
    --restart always \
    privatesky/psk_node
