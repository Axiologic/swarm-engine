#!/bin/bash

docker build -t privatesky/psk_node "$(dirname $(readlink -f $0))" --no-cache
