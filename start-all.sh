#!/bin/bash

# Distributed Chat System - Startup Script
# =========================================
# PDC Lab Exam - Fall 2025

echo "=========================================="
echo "  DISTRIBUTED CHAT SYSTEM - STARTUP"
echo "=========================================="

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Kill any existing services
echo "Stopping any existing services..."
pkill -f "translation-service/server.js" 2>/dev/null
pkill -f "audio-service/server.js" 2>/dev/null
pkill -f "api-gateway/server.js" 2>/dev/null
sleep 2

# Start Translation Service
echo ""
echo "[1/3] Starting Translation Service (Port 50051)..."
cd "$SCRIPT_DIR/translation-service"
node server.js &
TRANS_PID=$!
echo "  PID: $TRANS_PID"
sleep 2

# Start Audio Service
echo ""
echo "[2/3] Starting Audio Service (Port 50052)..."
cd "$SCRIPT_DIR/audio-service"
node server.js &
AUDIO_PID=$!
echo "  PID: $AUDIO_PID"
sleep 2

# Start API Gateway
echo ""
echo "[3/3] Starting API Gateway (Port 3000)..."
cd "$SCRIPT_DIR/api-gateway"
node server.js &
GATEWAY_PID=$!
echo "  PID: $GATEWAY_PID"
sleep 2

echo ""
echo "=========================================="
echo "  ALL SERVICES STARTED"
echo "=========================================="
echo ""
echo "  Translation Service: http://localhost:50051 (gRPC)"
echo "  Audio Service:       http://localhost:50052 (gRPC)"
echo "  API Gateway:         http://localhost:3000  (REST)"
echo ""
echo "  To test: curl http://localhost:3000/api/health"
echo ""
echo "  Press Ctrl+C to stop all services"
echo "=========================================="

# Wait for all background processes
wait
