#!/usr/bin/env bash
# Format and re-stage fully staged files only. Check partial changes in place.

if [ -n "$FORMAT_FULLY_STAGED" ]; then
  npx --no-install vp fmt $FORMAT_FULLY_STAGED
  git add $FORMAT_FULLY_STAGED
fi

if [ -n "$FORMAT_STAGED" ]; then
  npx --no-install vp fmt --check $FORMAT_STAGED
fi

# Oxfmt cannot parse Flow definitions.
if [ -n "$FLOW_FULLY_STAGED" ]; then
  npx --no-install prettier --write $FLOW_FULLY_STAGED
  git add $FLOW_FULLY_STAGED
fi

if [ -n "$FLOW_STAGED" ]; then
  npx --no-install prettier --check $FLOW_STAGED
fi
