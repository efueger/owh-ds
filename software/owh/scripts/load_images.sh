#!/usr/bin/env bash

set -e
echo "** Loading images ***"
cd /tmp/deploy
echo "- Executing in /tmp/deploy -"
echo "checking out code from git................"
mkdir -p /usr/local/owh/codebase
cd  /usr/local/owh/codebase
git pull
echo "***Checkout completed successfully***"
echo "building docker images......"
cd /usr/local/owh/codebase/software/owh
docker-compose build
echo "***completed***"
