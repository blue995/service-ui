#!/bin/bash

CURRENT_DIR=$PWD
BASEDIR=$(dirname "$0")

cd "$BASEDIR"/..
git remote rename origin patched
git remote add origin https://github.com/reportportal/service-ui.git
git fetch origin
git branch master --set-upstream-to origin/master
git checkout service-ui-with-tfs
cd "$CURRENT_DIR"