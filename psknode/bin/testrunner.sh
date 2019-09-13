#!/bin/bash

node "$(dirname $(readlink -f $0))/scripts/testrunner.js" "$@"
