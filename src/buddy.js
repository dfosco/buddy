/**
 * Buddy - The Monitor Character (textmode.js version)
 * An ASCII face that lives on your screen
 */

import { expressions, getRandomExpression } from './expressions.js';
import { lerpExpression, bounce, smoothNoise, easing } from './animations.js';

// CRT amber/orange character color (less contrasting)
const CHAR_COLOR = [255, 180, 100];
const BG_COLOR = [25, 12, 5];

// ASCII art patterns for face elements
const FACE_CHARS = {
  eyeOpen: 'O',
  eyeClosed: '-',
  eyeHalf: 'o',
  pupil: '●',
  pupilSmall: '•',
  mouthSmile: ['\\', '_', '/'],
  mouthBigSmile: ['\\', '‿', '/'],
  mouthFlat: ['─', '─', '─'],
  mouthOpen: ['(', 'O', ')'],
  mouthSmallO: ['(', 'o', ')'],
  blush: '*',
  sparkle: '✦',
};

export class Buddy {
  constructor(t) {
    this.t = t;
    
    // Animation state
    this.time = 0;
    this.currentExpression = { ...expressions.neutral };
    this.targetExpression = { ...expressions.neutral };
    this.transitionProgress = 1;
    this.transitionDuration = 400;
    
    // Expression timing
    this.expressionTimer = 0;
    this.nextExpressionTime = this.getRandomInterval();
    this.isInNeutral = true;
    
    // Blink state
    this.blinkTimer = 0;
    this.nextBlinkTime = this.getRandomBlinkTime();
    this.isBlinking = false;
    this.blinkProgress = 0;
    
    // Position offset for bounce (current smoothed position)
    this.offsetX = 0;
    this.offsetY = 0;
    
    // Target position (calculated from bounce/noise)
    this.targetOffsetX = 0;
    this.targetOffsetY = 0;
  }
  
  getRandomInterval() {
    return 180 + Math.random() * 240; // 3-7 seconds at 60fps
  }
  
  getRandomBlinkTime() {
    return 120 + Math.random() * 240; // 2-6 seconds at 60fps
  }
  
  update(frameCount) {
    this.time = frameCount / 60;
    
    // Update expression transition
    this.updateExpressionTransition();
    
    // Update expression timer
    this.updateExpressionTimer();
    
    // Update blink
    this.updateBlink();
    
    // Get current interpolated state
    const state = this.getCurrentState();
    
    // Calculate target position based on expression
    const { movement } = state;
    this.targetOffsetY = bounce(this.time, movement.bounce * 0.5, movement.speed * 0.3);
    this.targetOffsetX = (movement.tiltX || 0) * 0.5 + smoothNoise(this.time * 0.1) * 0.1;
    
    // Smooth lerp toward target (easing factor controls speed)
    const lerpFactor = 0.08; // Lower = smoother/slower movement
    this.offsetX = this.offsetX + (this.targetOffsetX - this.offsetX) * lerpFactor;
    this.offsetY = this.offsetY + (this.targetOffsetY - this.offsetY) * lerpFactor;
  }
  
  updateExpressionTransition() {
    if (this.transitionProgress < 1) {
      this.transitionProgress += 1 / 30; // Slower transition (~500ms)
      this.transitionProgress = Math.min(this.transitionProgress, 1);
    }
  }
  
  updateExpressionTimer() {
    this.expressionTimer += 1;
    
    if (this.expressionTimer >= this.nextExpressionTime) {
      this.expressionTimer = 0;
      
      if (this.isInNeutral) {
        const newExpression = getRandomExpression(this.targetExpression.name);
        this.setExpression(newExpression);
        this.nextExpressionTime = newExpression.duration / 16.67;
        this.isInNeutral = false;
      } else {
        this.setExpression(expressions.neutral);
        this.nextExpressionTime = this.getRandomInterval();
        this.isInNeutral = true;
      }
    }
  }
  
  updateBlink() {
    this.blinkTimer += 1;
    
    if (this.isBlinking) {
      this.blinkProgress += 1 / 18; // ~300ms blink at 60fps (longer, smoother)
      if (this.blinkProgress >= 1) {
        this.isBlinking = false;
        this.blinkProgress = 0;
        this.blinkTimer = 0;
        this.nextBlinkTime = this.getRandomBlinkTime();
      }
    } else if (this.blinkTimer >= this.nextBlinkTime) {
      this.isBlinking = true;
      this.blinkProgress = 0;
    }
  }
  
  setExpression(expression) {
    this.currentExpression = this.getCurrentState();
    this.targetExpression = expression;
    this.transitionProgress = 0;
  }
  
  getCurrentState() {
    if (this.transitionProgress >= 1) {
      return this.targetExpression;
    }
    return lerpExpression(
      this.currentExpression,
      this.targetExpression,
      this.transitionProgress,
      easing.easeOutBack
    );
  }
  
  // Helper to draw a single character at position (0,0 = center of screen)
  drawCharAt(t, char, x, y) {
    t.push();
    t.translate(Math.round(x), Math.round(y));
    t.char(char);
    t.charColor(CHAR_COLOR[0], CHAR_COLOR[1], CHAR_COLOR[2]);
    t.cellColor(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2]);
    t.point();
    t.pop();
  }
  
  draw(t) {
    // Guard against grid not being ready
    if (!t.grid || !t.grid.cols || !t.grid.rows) {
      return;
    }
    
    const state = this.getCurrentState();
    const { eyes, mouth: mouthState } = state;
    
    // textmode.js coordinate system is centered at (0,0)
    // So we just use our small offsets directly
    const posX = this.offsetX;
    const posY = this.offsetY;
    
    // Eye spacing
    const eyeSpacing = 4;
    
    // Draw eyes
    this.drawEye(t, -eyeSpacing + posX, -2 + posY, eyes, -1);
    this.drawEye(t, eyeSpacing + posX, -2 + posY, eyes, 1);
    
    // Draw mouth
    this.drawMouth(t, posX, 2 + posY, mouthState);
    
    // Draw blush if happy/excited
    if (state.name === 'happy' || state.name === 'excited') {
      this.drawBlush(t, posX, posY);
    }
    
    // Draw sparkles if excited
    if (eyes.sparkle) {
      this.drawSparkles(t, posX, posY);
    }
  }
  
  drawEye(t, x, y, eyeState, side) {
    const { openness, lookX, lookY, squint, winkLeft, sparkle } = eyeState;
    
    // Handle wink
    const isWinking = winkLeft && side === -1;
    let effectiveOpenness = isWinking ? 0 : openness;
    
    // Handle blink
    if (this.isBlinking && !isWinking) {
      const blinkFactor = this.blinkProgress < 0.5
        ? 1 - (this.blinkProgress * 2)
        : (this.blinkProgress - 0.5) * 2;
      effectiveOpenness *= blinkFactor;
    }
    
    // Determine eye character based on openness
    let eyeChar;
    if (effectiveOpenness < 0.3) {
      eyeChar = FACE_CHARS.eyeClosed;
    } else if (effectiveOpenness < 0.7 || squint > 0.2) {
      eyeChar = FACE_CHARS.eyeHalf;
    } else {
      eyeChar = FACE_CHARS.eyeOpen;
    }
    
    // Eye color (CRT amber)
    t.charColor(CHAR_COLOR[0], CHAR_COLOR[1], CHAR_COLOR[2]);
    
    if (effectiveOpenness > 0.3) {
      // Draw eye with parentheses border
      this.drawCharAt(t, '(', x - 1, y);
      this.drawCharAt(t, eyeChar, x, y);
      this.drawCharAt(t, ')', x + 1, y);
      
      // Draw pupil inside if eye is open enough
      if (effectiveOpenness > 0.5) {
        const pupilOffsetX = Math.round(lookX * 0.5);
        const pupilOffsetY = Math.round(lookY * 0.3);
        
        t.charColor(60, 30, 15); // Dark amber for pupil
        this.drawCharAt(t, sparkle ? FACE_CHARS.sparkle : FACE_CHARS.pupil, x + pupilOffsetX, y + pupilOffsetY);
      }
    } else {
      // Simple closed eye
      this.drawCharAt(t, eyeChar, x, y);
    }
  }
  
  drawMouth(t, x, y, mouthState) {
    const { smile, openness, width, offset = 0 } = mouthState;
    const offsetX = Math.round(offset * 2);
    
    t.charColor(CHAR_COLOR[0], CHAR_COLOR[1], CHAR_COLOR[2]);
    
    // Determine mouth type based on state
    let mouthChars;
    if (openness > 0.5) {
      mouthChars = FACE_CHARS.mouthOpen;
    } else if (openness > 0.2) {
      mouthChars = FACE_CHARS.mouthSmallO;
    } else if (smile > 0.6) {
      mouthChars = FACE_CHARS.mouthBigSmile;
    } else if (smile > 0.1) {
      mouthChars = FACE_CHARS.mouthSmile;
    } else {
      mouthChars = FACE_CHARS.mouthFlat;
    }
    
    // Draw mouth (3 characters wide)
    this.drawCharAt(t, mouthChars[0], x - 1 + offsetX, y);
    this.drawCharAt(t, mouthChars[1], x + offsetX, y);
    this.drawCharAt(t, mouthChars[2], x + 1 + offsetX, y);
  }
  
  drawBlush(t, centerX, centerY) {
    const blushAlpha = Math.floor((0.5 + Math.sin(this.time * 2) * 0.2) * 255);
    t.charColor(255, 120, 60, blushAlpha); // Warmer blush
    
    // Left blush
    this.drawCharAt(t, FACE_CHARS.blush, centerX - 7, centerY);
    
    // Right blush
    this.drawCharAt(t, FACE_CHARS.blush, centerX + 7, centerY);
  }
  
  drawSparkles(t, centerX, centerY) {
    const sparklePositions = [
      [-6, -4], [6, -4], [-5, -1], [5, -1]
    ];
    
    sparklePositions.forEach(([dx, dy], i) => {
      const visible = Math.sin(this.time * 8 + i * 1.5) > 0;
      if (visible) {
        t.charColor(255, 220, 150); // Warm sparkle
        this.drawCharAt(t, FACE_CHARS.sparkle, centerX + dx, centerY + dy);
      }
    });
  }
  
  // Public method to trigger specific expression
  triggerExpression(name) {
    if (expressions[name]) {
      this.setExpression(expressions[name]);
      this.expressionTimer = 0;
      this.nextExpressionTime = expressions[name].duration / 16.67;
      this.isInNeutral = false;
    }
  }
}
