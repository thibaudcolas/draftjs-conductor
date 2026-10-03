#!/usr/bin/env bash

set -e

if [ -n "$JS_STAGED" ] || [ -n "$SNAPSHOT_STAGED" ] || [ -n "$TEST_CONFIG_STAGED" ];
then
  npm run test:versions -s
fi
