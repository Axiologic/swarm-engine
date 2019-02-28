#!/bin/bash
node "$(dirname $(readlink -f $0))/../modules/csb-wizard/cli/index.js" "$@"
