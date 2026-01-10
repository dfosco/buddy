# Buddy - Animated Monitor Character

## Overview
Buddy is an animated character designed to serve as a living background for an external monitor. The character embodies the monitor itself — a face without a head, expressing emotions through eye movements, expressions, and subtle animations.

## Design Philosophy
- **Aesthetic**: Classic Mac/Finder smiley face meets GitHub Copilot mascot, rendered in ASCII-inspired minimalist style
- **Character**: Buddy IS the monitor — no separate head, just expressive facial features floating on screen
- **Animation**: Smooth, bouncy transitions between expressions with a neutral idle state

## Technical Stack
- **Framework**: Vite (vanilla JavaScript)
- **Graphics**: Paper.js for vector-based animations
- **Deployment**: Local development server with Chrome kiosk mode launcher

## Features

### Core Character Elements
1. **Eyes**: Large, expressive circles that can:
   - Blink (synchronized and asynchronous)
   - Look in different directions (left, right, up, down)
   - Squint, widen, or close for expressions
   - Have subtle bounce/float animation

2. **Mouth**: Simple curved line that can:
   - Smile (various intensities)
   - Form an "O" shape (surprise)
   - Slight frown
   - Wiggle animation

3. **Optional Accent Elements**:
   - Subtle blush marks
   - Eyebrow-like arcs for emphasis

### Expressions Library
| Expression | Eyes | Mouth | Movement |
|------------|------|-------|----------|
| Neutral/Idle | Open, slight bounce | Gentle smile | Subtle floating |
| Happy | Wide, sparkly | Big smile | Upward bounce |
| Curious | One raised, looking side | Small "o" | Head tilt implied |
| Sleepy | Half-closed, slow blink | Relaxed smile | Slow drift down |
| Excited | Wide, rapid movement | Open smile | Vigorous bounce |
| Thinking | Looking up-left | Flat line | Slow drift up |
| Wink | One closed | Smile | Side movement |

### Animation System
1. **Idle State**: 
   - Gentle floating/breathing motion
   - Occasional slow blinks
   - Eyes occasionally drift to look around

2. **Expression Transitions**:
   - Smooth easing between states
   - Brief return to neutral between expressions
   - Random expression selection with weighted probabilities

3. **Timing**:
   - Idle: 3-6 seconds
   - Expression duration: 2-4 seconds
   - Transition: 0.3-0.5 seconds

## File Structure
```
buddy/
├── index.html          # Main HTML with canvas
├── src/
│   ├── main.js         # Entry point, Paper.js setup
│   ├── buddy.js        # Main character class
│   ├── expressions.js  # Expression definitions
│   └── animations.js   # Animation utilities
├── public/
├── style.css           # Minimal styling
├── launch-kiosk.sh     # Chrome kiosk launcher script
└── PRD.md              # This document
```

## Kiosk Mode
A shell script (`launch-kiosk.sh`) will:
1. Start the Vite dev server
2. Wait for server to be ready
3. Launch Chrome in kiosk/app mode pointing to localhost
4. Provide instructions for fullscreen toggle

## Success Criteria
- [x] Smooth 60fps animations
- [x] Clean transitions between expressions
- [x] Random but natural-feeling expression changes
- [x] Works in Chrome kiosk mode
- [x] Responsive to window size
