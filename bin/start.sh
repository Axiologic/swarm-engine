#!/bin/bash
node "$(dirname $(readlink -f $0))/../engine/launcher.js" "$@"