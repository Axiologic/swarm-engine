#!/bin/bash

current_path=$(realpath .)

source /etc/bash.bashrc
source ~/.bashrc

current_bin_path="${current_path}/bin"
psknode_bin_path="${current_path}/psknode/bin"

export PATH="${current_bin_path}:${psknode_bin_path}:$PATH"
