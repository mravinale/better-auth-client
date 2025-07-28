#!/bin/bash

set -e

IDP_DIR="../IdP"
API_DIR="."
IDP_PORT=3000
API_PORT=3005

# Start IdP
cd "$IDP_DIR"
yarn dev > /tmp/idp.log 2>&1 &
IDP_PID=$!
cd -

# Start API
cd "$API_DIR"
yarn dev > /tmp/api.log 2>&1 &
API_PID=$!
cd -

# Wait for servers
wait_for_port() {
  local port=$1
  local name=$2
  for i in {1..30}; do
    if nc -z localhost $port; then
      echo "$name is up"
      return 0
    fi
    sleep 1
  done
  echo "ERROR: $name did not start in time"
  return 1
}

wait_for_port $IDP_PORT "IdP"
wait_for_port $API_PORT "API"

# Run E2E test (only the Jest test, not this script)
yarn --cwd ./Api test:only

# Cleanup
kill $IDP_PID $API_PID
