#!/bin/bash

current_path=$(realpath .)

if [ -x /etc/bash.bashrc ]; then
	source /etc/bash.bashrc
fi

if [ -x /etc/bashrc ]; then
	source /etc/bashrc
fi

source ~/.bashrc

current_bin_path="${current_path}/bin"
psknode_bin_path="${current_path}/psknode/bin"
psknode_bin__cmds__path="${current_path}/psknode/bin/cmds"

export PATH="${current_bin_path}:${psknode_bin_path}:${psknode_bin__cmds__path}:$PATH"
export PS1="[PSK-BASH \W]$ "