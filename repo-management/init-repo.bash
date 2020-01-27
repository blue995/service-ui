#!/bin/bash

CURRENT_DIR=$PWD
BASEDIR=$(dirname "$0")

cd "$BASEDIR"/..
git remote add main https://github.com/reportportal/service-ui.git
git fetch main
git checkout -t main/master
git checkout service-ui-with-tfs
cd "$CURRENT_DIR"