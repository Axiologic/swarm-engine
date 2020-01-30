#!/bin/bash
node "$(dirname "$(readlink -f "$0")")/../bundles/walletBoot.js" "$@"
