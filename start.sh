#!/bin/bash
set -e

# Start OpenClaw gateway in background
openclaw gateway --allow-unconfigured --bind lan --port ${PORT:-8080} &
GATEWAY_PID=$!

echo "OpenClaw gateway starting (PID: $GATEWAY_PID)..."

# Wait for gateway to be ready (check for up to 30 seconds)
for i in {1..30}; do
    if openclaw daemon status > /dev/null 2>&1; then
        echo "Gateway is ready!"
        break
    fi
    echo "Waiting for gateway... ($i/30)"
    sleep 1
done

# Approve Telegram pairing
# Continuous pairing approval loop in background
(
  while true; do
    if [ -n "$PAIRING_CODE" ]; then
      echo "Attempting to approve pairing code: $PAIRING_CODE"
      openclaw pairing approve telegram "$PAIRING_CODE" 2>&1 | tee -a /tmp/pairing.log
      if grep -q "Successfully approved" /tmp/pairing.log 2>/dev/null; then
        echo "Pairing successful! Clearing PAIRING_CODE"
        unset PAIRING_CODE
      fi
    fi
    sleep 5
  done
) &

# Keep container running by waiting for gateway process
echo "OpenClaw gateway running. Waiting for process..."
wait $GATEWAY_PID
