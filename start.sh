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
echo "Approving Telegram pairing with code RK53JMLZ..."
openclaw pairing approve telegram RK53JMLZ || echo "Pairing approval failed or already approved"

# Keep container running by waiting for gateway process
echo "OpenClaw gateway running. Waiting for process..."
wait $GATEWAY_PID
