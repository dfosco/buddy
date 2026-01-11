#!/bin/bash
#
# Buddy Kiosk Launcher
# Launches Chrome in kiosk-like app mode pointing to GitHub Pages
#

set -e

URL="https://dfosco.github.io/buddy/"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🤖 Starting Buddy...${NC}"

# Check if Chrome Canary or Chrome is available (prefer Chrome Canary for independent instance)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [ -d "/Applications/Google Chrome Canary.app" ]; then
        CHROME_PATH="/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary"
    else
        CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CHROME_PATH=$(which google-chrome-unstable || which chromium || which chromium-browser || which google-chrome)
else
    CHROME_PATH=$(which google-chrome-unstable || which chromium || which chrome || which google-chrome)
fi

if [ ! -f "$CHROME_PATH" ] && [ -z "$CHROME_PATH" ]; then
    echo -e "${RED}Chrome/Chromium not found. Please install Chromium or Google Chrome.${NC}"
    exit 1
fi

# Use a separate user data directory to run as independent instance
BUDDY_DATA_DIR="$PROJECT_DIR/.buddy-chrome-data"
mkdir -p "$BUDDY_DATA_DIR"

# Launch Chrome in app mode
echo -e "${GREEN}Launching Chrome in app mode...${NC}"
echo -e "${YELLOW}Press Cmd+Shift+F (Mac) or F11 (Windows/Linux) for fullscreen${NC}"

if [[ "$OSTYPE" == "darwin"* ]]; then
    "$CHROME_PATH" \
        --app="$URL" \
        --user-data-dir="$BUDDY_DATA_DIR" \
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
        --user-data-dir="$BUDDY_DATA_DIR" \
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

echo -e "${GREEN}Buddy launched!${NC}"
