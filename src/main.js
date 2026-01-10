/**
 * Buddy - Main Entry Point
 * ASCII character that lives on your screen using textmode.js
 */

import { textmode } from 'textmode.js';
import { Buddy, BG_COLOR } from './buddy.js';

// Create textmode instance with larger font
const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  fontSize: 32, // Larger characters
  frameRate: 60,
});

let buddy;

t.setup(() => {
  buddy = new Buddy(t);
  console.log('🤖 Buddy is alive! Try: buddy.triggerExpression("happy")');
  window.buddy = buddy;
  
  // Hide loading screen
  const loading = document.getElementById('loading');
  if (loading) loading.classList.add('hidden');
});

t.draw(() => {
  t.background(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2]);
  buddy.update(t.frameCount);
  buddy.draw(t);
  

});

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
