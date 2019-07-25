#!/bin/bash
node "$(dirname "$(readlink -f "$0")")/../../modules/pskwallet/pskwallet.js" "$@"
