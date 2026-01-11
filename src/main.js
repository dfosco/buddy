/**
 * Buddy - Main Entry Point
 */

import { textmode } from 'textmode.js';
import { Buddy, BG_COLOR } from './buddy.js';

const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  fontSize: 32,
  frameRate: 60,
});

let buddy;

t.setup(() => {
  buddy = new Buddy(t);
  window.buddy = buddy;
  
  const loading = document.getElementById('loading');
  if (loading) loading.classList.add('hidden');
});

t.draw(() => {
  t.background(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2]);
  buddy.update();
  buddy.draw(t);
});

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
