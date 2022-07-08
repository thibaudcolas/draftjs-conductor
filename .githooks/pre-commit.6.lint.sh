#!/usr/bin/env bash

if [ -n "$JS_STAGED" ];
then
  npx eslint --cache --cache-location ./node_modules/.cache/ $JS_STAGED
fi
