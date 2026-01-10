#!/bin/bash
#
# Buddy Kiosk Launcher
# Starts Vite dev server and launches Chrome in kiosk-like app mode
#

set -e

# Configuration
PORT=5173
URL="http://localhost:$PORT"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🤖 Starting Buddy...${NC}"

# Check if Chrome is available
if [[ "$OSTYPE" == "darwin"* ]]; then
    CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CHROME_PATH=$(which google-chrome || which chromium-browser || which chromium)
else
    CHROME_PATH=$(which chrome || which google-chrome)
fi

if [ ! -f "$CHROME_PATH" ] && [ -z "$CHROME_PATH" ]; then
    echo "Chrome not found. Please install Google Chrome."
    exit 1
fi

# Change to project directory
cd "$PROJECT_DIR"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down Buddy...${NC}"
    if [ ! -z "$VITE_PID" ]; then
        kill $VITE_PID 2>/dev/null || true
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Vite dev server in background
echo "Starting Vite dev server..."
npm run dev -- --port $PORT &
VITE_PID=$!

# Wait for server to be ready
echo "Waiting for server to start..."
for i in {1..30}; do
    if curl -s "$URL" > /dev/null 2>&1; then
        echo -e "${GREEN}Server ready!${NC}"
        break
    fi
    sleep 0.5
done

# Small delay to ensure everything is loaded
sleep 1

# Launch Chrome in app mode (kiosk-like without full kiosk lock)
echo -e "${GREEN}Launching Chrome in app mode...${NC}"
echo -e "${YELLOW}Press Cmd+Shift+F (Mac) or F11 (Windows/Linux) for fullscreen${NC}"
echo -e "${YELLOW}Press Ctrl+C in this terminal to stop Buddy${NC}"

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - use open command for better handling
    "$CHROME_PATH" \
        --app="$URL" \
        --window-size=1920,1080 \
        --disable-extensions \
        --disable-plugins \
        --disable-sync \
        --no-first-run \
        --disable-default-apps \
        --disable-translate \
        --disable-background-networking \
        --disable-infobars \
        --autoplay-policy=no-user-gesture-required \
        2>/dev/null &
else
    # Linux/Windows
    "$CHROME_PATH" \
        --app="$URL" \
        --start-maximized \
        --disable-extensions \
        --disable-plugins \
        --disable-sync \
        --no-first-run \
        --disable-default-apps \
        --disable-translate \
        --disable-background-networking \
        --disable-infobars \
        --autoplay-policy=no-user-gesture-required \
        2>/dev/null &
fi

# Wait for Vite process (keeps script running)
wait $VITE_PID
