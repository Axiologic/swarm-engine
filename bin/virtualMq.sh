#!/bin/bash
node "$(dirname $(readlink -f $0))/scripts/virtualMq.js" "$@"