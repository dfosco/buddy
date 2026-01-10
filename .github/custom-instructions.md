# textmode.js Documentation

> Comprehensive reference for textmode.js - a lightweight creative-coding library for real-time ASCII and textmode graphics in the browser.

**Official Resources:**
- Documentation: https://code.textmode.art/
- Web Editor: https://editor.textmode.art/
- GitHub: https://github.com/humanbydefinition/textmode.js

---

## Table of Contents

1. [Introduction](#introduction)
2. [Installation & Setup](#installation--setup)
3. [Fundamentals](#fundamentals)
4. [Drawing API](#drawing-api)
5. [Colors & Styling](#colors--styling)
6. [Transformations](#transformations)
7. [Events & Input](#events--input)
8. [Animation Loop](#animation-loop)
9. [Layers & Filters](#layers--filters)
10. [Image & Video](#image--video)
11. [Exporting](#exporting)
12. [API Reference](#api-reference)

---

## Introduction

**textmode.js** is a free, lightweight, and framework-agnostic creative-coding library for real-time ASCII and textmode graphics in the browser. It combines a grid-based API with a modern WebGL2 pipeline for smooth, high-performance rendering.

### Key Features

- Real-time ASCII/textmode rendering with a simple drawing API
- Font system with runtime font loading and dynamic sizing (TTF/OTF/WOFF)
- Dynamic layering system with blend modes and opacity
- Filter system with built-in filters and custom GLSL shaders
- Load images and videos as sources with customizable textmode styles
- Flexible exporting: TXT, SVG, PNG/JPG/WebP, animated GIFs, and WebM video
- Animation loop control: `frameRate`, `loop`/`noLoop`, `redraw`, `frameCount`
- Framework-agnostic: works with any canvas-based framework
- Zero dependencies, written in TypeScript

### Coordinate System

**Important:** textmode.js uses a **centered coordinate system** where `(0, 0)` is the center of the screen/canvas. Positive X goes right, positive Y goes down.

```
        -Y (up)
          |
  -X -----+------ +X (right)
          |
        +Y (down)
```

---

## Installation & Setup

### Prerequisites

- Modern web browser with WebGL2 support
- Optional: `<canvas>` element (library creates one if not provided)
- Optional: Node.js 16+ and npm for ESM projects

### UMD (CDN)

```html
<!DOCTYPE html>
<html>
<head>
    <title>textmode.js sketch</title>
    <script src="https://cdn.jsdelivr.net/npm/textmode.js@latest/dist/textmode.umd.js"></script>
</head>
<body>
    <script src="sketch.js"></script>
</body>
</html>
```

### ESM (npm)

```bash
npm install textmode.js
```

```javascript
import { textmode } from 'textmode.js';
```

### Basic Setup

```javascript
const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 16,
    frameRate: 60
});

t.setup(() => {
    // Initialization code (load fonts, shaders, etc.)
});

t.draw(() => {
    t.background(32);
    // Drawing code here
});

t.windowResized(() => {
    t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | number | 800 | Canvas width in pixels |
| `height` | number | 600 | Canvas height in pixels |
| `fontSize` | number | 16 | Font size in pixels |
| `frameRate` | number | 60 | Target frames per second |
| `canvas` | HTMLCanvasElement | null | Existing canvas element |

---

## Fundamentals

### The Grid

textmode.js renders to a character grid. The grid dimensions are calculated from canvas size and font size:

```javascript
t.grid.cols  // Number of columns
t.grid.rows  // Number of rows
```

### Basic Drawing Pattern

1. Set the character with `t.char()`
2. Set colors with `t.charColor()` and `t.cellColor()`
3. Draw a shape (`t.point()`, `t.rect()`, `t.ellipse()`, etc.)

```javascript
t.draw(() => {
    t.background(0);           // Clear with black
    
    t.char('A');               // Set character to draw
    t.charColor(255, 0, 0);    // Red text
    t.cellColor(0, 0, 0);      // Black background
    t.rect(10, 10);            // Draw 10x10 rectangle of 'A's
});
```

### Push/Pop State

Save and restore drawing state:

```javascript
t.push();                      // Save current state
t.translate(5, 5);
t.char('X');
t.charColor(255, 255, 0);
t.rect(3, 3);
t.pop();                       // Restore previous state
```

---

## Drawing API

### Primitive Shapes

#### `t.point()`
Draws a single character at the current position (after translate).

```javascript
t.translate(10, 5);
t.char('@');
t.point();
```

#### `t.rect(width, height)`
Draws a filled rectangle of characters.

```javascript
t.char('#');
t.rect(20, 10);  // 20 columns x 10 rows
```

#### `t.ellipse(width, height)`
Draws an ellipse of characters.

```javascript
t.char('O');
t.ellipse(10, 8);
```

#### `t.line(x1, y1, x2, y2)`
Draws a line between two points.

```javascript
t.char('-');
t.line(0, 0, 20, 10);
```

#### `t.triangle(x1, y1, x2, y2, x3, y3)`
Draws a filled triangle.

```javascript
t.char('*');
t.triangle(0, 0, 10, 0, 5, 8);
```

#### `t.arc(width, height, startAngle, endAngle)`
Draws an arc (angles in degrees).

```javascript
t.char('.');
t.arc(10, 10, 0, 180);  // Half circle
```

### Drawing at Specific Positions

To draw at a specific grid position, use `translate()`:

```javascript
t.push();
t.translate(x, y);    // Move origin to (x, y)
t.char('A');
t.point();            // Draw single character
t.pop();
```

Or for rectangles starting at a position:

```javascript
t.push();
t.translate(startX, startY);
t.char('#');
t.rect(width, height);
t.pop();
```

---

## Colors & Styling

### Character Color

Sets the foreground color of characters:

```javascript
// RGB
t.charColor(255, 128, 0);

// RGBA
t.charColor(255, 128, 0, 200);

// Grayscale
t.charColor(128);

// Hex string
t.charColor('#ff8000');
```

### Cell Color

Sets the background color behind characters:

```javascript
t.cellColor(32, 32, 32);      // Dark gray background
t.cellColor('#202020');        // Hex string
```

### Background

Fills the entire canvas with a color:

```javascript
t.background(0);               // Black
t.background(32, 32, 48);      // Dark blue-gray
t.background('#1a1a2e');       // Hex string
```

### Color Object

Create reusable colors:

```javascript
const myColor = t.color(255, 100, 50);
t.charColor(myColor);
```

### Character Transformations

```javascript
t.charRotation(90);   // Rotate character 90 degrees
t.flipX(true);        // Flip horizontally
t.flipY(true);        // Flip vertically
t.invert(true);       // Invert colors
```

---

## Transformations

### Translate

Moves the drawing origin:

```javascript
t.translate(10, 5);   // Move origin 10 right, 5 down
```

### Rotate

Rotates subsequent drawing:

```javascript
t.rotateZ(45);        // Rotate 45 degrees around Z axis
```

### Scale

Scales subsequent drawing:

```javascript
t.scale(2, 2);        // Double size
```

### Transformation Stack

```javascript
t.push();             // Save state
t.translate(10, 10);
t.rotateZ(45);
// Draw something
t.pop();              // Restore state
```

---

## Events & Input

### Window Resize

```javascript
t.windowResized(() => {
    t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

### Mouse Input

textmode.js provides mouse position in grid coordinates:

```javascript
t.draw(() => {
    // Mouse position in grid cells
    const mouseX = t.mouseX;
    const mouseY = t.mouseY;
    
    // Previous mouse position
    const pmouseX = t.pmouseX;
    const pmouseY = t.pmouseY;
    
    // Mouse button state
    const isPressed = t.mouseIsPressed;
});

// Mouse event callbacks
t.mousePressed(() => {
    console.log('Mouse pressed at', t.mouseX, t.mouseY);
});

t.mouseReleased(() => {
    console.log('Mouse released');
});

t.mouseMoved(() => {
    // Called when mouse moves
});

t.mouseDragged(() => {
    // Called when mouse moves while pressed
});

t.mouseClicked(() => {
    // Called on click
});
```

### Keyboard Input

```javascript
t.draw(() => {
    // Current key
    const key = t.key;
    const keyCode = t.keyCode;
    const keyIsPressed = t.keyIsPressed;
});

t.keyPressed(() => {
    if (t.key === 'a') {
        // Handle 'a' key
    }
    if (t.keyCode === 32) {
        // Handle spacebar
    }
});

t.keyReleased(() => {
    // Called when key is released
});

t.keyTyped(() => {
    // Called when a character is typed
});
```

### Touch Input

```javascript
t.touchStarted(() => {
    // Handle touch start
});

t.touchMoved(() => {
    // Handle touch move
});

t.touchEnded(() => {
    // Handle touch end
});
```

---

## Animation Loop

### Frame Control

```javascript
// Current frame number
const frame = t.frameCount;

// Control frame rate
t.frameRate(30);      // Set to 30 FPS

// Get actual frame rate
const fps = t.frameRate();

// Pause/resume
t.noLoop();           // Stop animation
t.loop();             // Resume animation

// Manual redraw (when noLoop is active)
t.redraw();
```

### Delta Time

```javascript
t.draw(() => {
    // Time since last frame in milliseconds
    const delta = t.deltaTime;
    
    // Use for frame-rate independent animation
    position += velocity * delta;
});
```

### Time-Based Animation

```javascript
t.draw(() => {
    // Oscillate using frameCount
    const wave = Math.sin(t.frameCount * 0.05);
    
    // Or use millis() for real time
    const time = t.millis() / 1000;  // Seconds since start
});
```

---

## Layers & Filters

### Layer System

Create multiple layers for complex scenes:

```javascript
t.setup(async () => {
    // Create a new layer
    const uiLayer = t.layers.add();
    
    // Configure layer
    uiLayer.opacity = 0.8;
    uiLayer.blendMode = 'multiply';
});

t.draw(() => {
    // Draw to base layer
    t.layers.base.draw(() => {
        t.background(0);
        // Base layer content
    });
    
    // Draw to UI layer
    uiLayer.draw(() => {
        // UI layer content
    });
});
```

### Built-in Filters

Apply post-processing effects:

```javascript
t.draw(() => {
    t.background(0);
    // Drawing code...
    
    // Apply filter
    t.filter('blur', { amount: 0.5 });
    t.filter('brightness', { amount: 1.2 });
    t.filter('contrast', { amount: 1.1 });
});
```

### Custom Shaders

Create custom effects with GLSL:

```javascript
let customShader;

t.setup(async () => {
    customShader = await t.createFilterShader(`#version 300 es
        precision highp float;
        in vec2 v_uv;
        uniform float u_time;
        
        layout(location = 0) out vec4 o_character;
        layout(location = 1) out vec4 o_primaryColor;
        layout(location = 2) out vec4 o_secondaryColor;
        
        void main() {
            // Custom shader logic
            float wave = sin(v_uv.x * 10.0 + u_time) * 0.5 + 0.5;
            o_primaryColor = vec4(wave, wave, wave, 1.0);
        }
    `);
});

t.draw(() => {
    t.shader(customShader);
    t.setUniform('u_time', t.frameCount * 0.1);
    t.rect(t.grid.cols, t.grid.rows);
});
```

---

## Image & Video

### Loading Images

```javascript
let img;

t.setup(async () => {
    img = await t.loadImage('path/to/image.jpg');
    
    // Configure conversion
    img.characters(' .:-=+*#%@');  // Character set for brightness
    img.charColorMode('sampled');   // Sample colors from image
    img.cellColorMode('fixed');
    img.cellColor(0, 0, 0);
});

t.draw(() => {
    t.background(0);
    t.image(img, t.grid.cols, t.grid.rows);
});
```

### Loading Videos

```javascript
let video;

t.setup(async () => {
    video = await t.loadVideo('path/to/video.mp4');
    video.play();
    video.loop();
    
    video.characters(' .:-=+*#%@');
});

t.draw(() => {
    t.background(0);
    t.image(video, t.grid.cols, t.grid.rows);
});
```

### Framebuffers

Render to offscreen buffers:

```javascript
let fb;

t.setup(() => {
    fb = t.createFramebuffer({
        width: 50,
        height: 30
    });
});

t.draw(() => {
    // Render to framebuffer
    fb.begin();
    t.background(255, 0, 0);
    t.char('A');
    t.rect(20, 10);
    fb.end();
    
    // Draw framebuffer to screen
    t.background(0);
    t.image(fb);
});
```

---

## Exporting

### Export Formats

textmode.js supports exporting via the `textmode.export.js` add-on:

- **Text:** `.txt` plain ASCII
- **Images:** `.png`, `.jpg`, `.webp`
- **Vector:** `.svg`
- **Animation:** `.gif`, `.webm`

### Basic Export

```javascript
// Save current frame as PNG
t.saveCanvas('myart', 'png');

// Save as text
t.saveText('myart');
```

---

## API Reference

### Core Methods

| Method | Description |
|--------|-------------|
| `textmode.create(options)` | Create new textmode instance |
| `t.setup(callback)` | Setup function (runs once) |
| `t.draw(callback)` | Draw function (runs every frame) |
| `t.windowResized(callback)` | Window resize handler |
| `t.resizeCanvas(w, h)` | Resize the canvas |

### Drawing Methods

| Method | Description |
|--------|-------------|
| `t.background(color)` | Fill background |
| `t.char(character)` | Set character to draw |
| `t.charColor(r, g, b, a?)` | Set character color |
| `t.cellColor(r, g, b, a?)` | Set cell background color |
| `t.point()` | Draw single character |
| `t.rect(w, h)` | Draw rectangle |
| `t.ellipse(w, h)` | Draw ellipse |
| `t.line(x1, y1, x2, y2)` | Draw line |
| `t.triangle(x1, y1, x2, y2, x3, y3)` | Draw triangle |
| `t.arc(w, h, start, end)` | Draw arc |
| `t.clear()` | Clear the canvas |

### Transformation Methods

| Method | Description |
|--------|-------------|
| `t.translate(x, y)` | Move origin |
| `t.rotateZ(degrees)` | Rotate around Z axis |
| `t.scale(sx, sy)` | Scale drawing |
| `t.push()` | Save state |
| `t.pop()` | Restore state |

### Character Style Methods

| Method | Description |
|--------|-------------|
| `t.charRotation(degrees)` | Rotate character |
| `t.flipX(bool)` | Flip horizontally |
| `t.flipY(bool)` | Flip vertically |
| `t.invert(bool)` | Invert colors |

### Animation Properties

| Property | Description |
|----------|-------------|
| `t.frameCount` | Current frame number |
| `t.deltaTime` | Time since last frame (ms) |
| `t.frameRate()` | Get/set frame rate |
| `t.loop()` | Start animation |
| `t.noLoop()` | Stop animation |
| `t.redraw()` | Manual redraw |
| `t.millis()` | Milliseconds since start |

### Grid Properties

| Property | Description |
|----------|-------------|
| `t.grid.cols` | Number of columns |
| `t.grid.rows` | Number of rows |
| `t.width` | Canvas width in pixels |
| `t.height` | Canvas height in pixels |

### Input Properties

| Property | Description |
|----------|-------------|
| `t.mouseX` | Mouse X in grid coords |
| `t.mouseY` | Mouse Y in grid coords |
| `t.pmouseX` | Previous mouse X |
| `t.pmouseY` | Previous mouse Y |
| `t.mouseIsPressed` | Mouse button state |
| `t.key` | Last key pressed |
| `t.keyCode` | Last key code |
| `t.keyIsPressed` | Key pressed state |

---

## Tips & Best Practices

### Performance

1. Use `push()`/`pop()` sparingly in tight loops
2. Prefer custom shaders for complex effects
3. Use framebuffers for static content
4. Keep character sets small for image conversion

### Common Patterns

#### Centering Content

```javascript
// textmode.js is already centered at (0,0)
// Just draw relative to center
t.translate(0, 0);  // Already at center
t.char('X');
t.point();
```

#### Drawing at Absolute Grid Position

```javascript
function drawAt(char, x, y) {
    t.push();
    t.translate(x, y);
    t.char(char);
    t.point();
    t.pop();
}
```

#### Smooth Animation

```javascript
// Use lerp for smooth movement
function lerp(current, target, factor) {
    return current + (target - current) * factor;
}

let posX = 0;
let targetX = 10;

t.draw(() => {
    posX = lerp(posX, targetX, 0.1);
});
```

---

## Troubleshooting

### Common Issues

1. **Nothing renders:** Check WebGL2 support, ensure `t.draw()` is called
2. **Wrong position:** Remember coordinate system is centered at (0,0)
3. **Colors not showing:** Call `charColor()`/`cellColor()` before drawing
4. **Performance issues:** Reduce grid size, use shaders, check for memory leaks

### Debug Tips

```javascript
t.draw(() => {
    // Log grid dimensions
    console.log('Grid:', t.grid.cols, 'x', t.grid.rows);
    
    // Draw grid origin marker
    t.char('+');
    t.charColor(255, 0, 0);
    t.translate(0, 0);
    t.point();
});
```

---

*Generated from textmode.js documentation at code.textmode.art*
*Last updated: January 2026*
