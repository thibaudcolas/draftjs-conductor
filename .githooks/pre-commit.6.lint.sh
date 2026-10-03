#!/usr/bin/env bash

if [ -n "$JS_STAGED" ]; then
  npx --no-install vp lint --deny-warnings $JS_STAGED
fi
