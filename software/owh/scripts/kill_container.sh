#!/usr/bin/env bash

set -e
echo "** Killing containers ***"
# This is to prevent first time run failures...
mkdir -p /usr/local/owh/codebase/software/owh
cd /usr/local/owh/codebase/software/owh
echo "- Executing in /tmp/deploy -"
ls
pwd
echo "- docker compose down - "
docker-compose down
echo " - removing images -"
docker rmi owh_web
echo "***completed***"
