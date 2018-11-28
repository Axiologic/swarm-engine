#!/bin/bash
node "$(dirname $(readlink -f $0))/../modules/pskadmin/pskadmin.js" "$@"
