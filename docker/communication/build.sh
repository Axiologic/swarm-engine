#!/bin/bash

docker build -t privatesky/virtualmq "$(dirname $(readlink -f $0))" --no-cache
