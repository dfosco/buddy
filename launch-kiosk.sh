#!/bin/bash
#
# Buddy Kiosk Launcher
# Serves built files and launches Chrome in kiosk-like app mode
#

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="$PROJECT_DIR/dist"
INDEX_FILE="$DIST_DIR/index.html"
PORT=8765
URL="http://localhost:$PORT"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🤖 Starting Buddy...${NC}"

# Check if build exists, if not build it
if [ ! -f "$INDEX_FILE" ]; then
    echo -e "${YELLOW}Build not found. Building...${NC}"
    cd "$PROJECT_DIR"
    npm run build
fi

# Check if Chrome is available
if [[ "$OSTYPE" == "darwin"* ]]; then
    CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CHROME_PATH=$(which google-chrome || which chromium-browser || which chromium)
else
    CHROME_PATH=$(which chrome || which google-chrome)
fi

if [ ! -f "$CHROME_PATH" ] && [ -z "$CHROME_PATH" ]; then
    echo -e "${RED}Chrome not found. Please install Google Chrome.${NC}"
    exit 1
fi

# Kill any existing server on this port
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true

# Start simple HTTP server in background
echo -e "${YELLOW}Starting local server on port $PORT...${NC}"
cd "$DIST_DIR"
python3 -m http.server $PORT --bind 127.0.0.1 > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 1

# Launch Chrome in app mode
echo -e "${GREEN}Launching Chrome in app mode...${NC}"
echo -e "${YELLOW}Press Cmd+Shift+F (Mac) or F11 (Windows/Linux) for fullscreen${NC}"

if [[ "$OSTYPE" == "darwin"* ]]; then
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

echo -e "${GREEN}Buddy launched! Server PID: $SERVER_PID${NC}"
echo -e "${YELLOW}To stop the server: kill $SERVER_PID${NC}"
