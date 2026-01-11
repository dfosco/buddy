/**
 * Buddy - A simple ASCII face
 */

// Convert HSL to RGB
function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

const HUE = Math.floor(Math.random() * 360);
const CHAR_COLOR = hslToRgb(HUE, 80, 70);
export const BG_COLOR = hslToRgb(HUE, 70, 6);

document.documentElement.style.setProperty('--char-color', `rgb(${CHAR_COLOR.join(',')})`);
document.documentElement.style.setProperty('--bg-color', `rgb(${BG_COLOR.join(',')})`);

const FACE = {
  eyeOpen: ['(', '●', ')'],
  eyeSparkle: ['(', '-', ')'],
  eyeClosed: '^',
  mouth: ['\\', '_', '_', '_', '/'],
  blush: '*',
};

// Default state: 'awake', 'sleeping', 'sparkle'
const DEFAULT_STATE = 'awake';

export class Buddy {
  static SLEEP_TIMEOUT = 45;
  
  constructor(t) {
    this.t = t;
    this.isSleeping = DEFAULT_STATE === 'sleeping';
    this.isBlinking = false;
    this.isSparkle = DEFAULT_STATE === 'sparkle';
    this.lastActivityTime = Date.now();
    this.lastBlinkTime = Date.now();
    this.lastStateChange = Date.now();
    this.nextStateChange = this.getRandomInterval();
    this.zzzPhase = 0;
    this.time = 0;
    
    this.setupActivityListener();
  }
  
  getRandomInterval() {
    return 45000 + Math.random() * 15000; // 45-60 seconds
  }
  
  setupActivityListener() {
    const resetActivity = () => {
      this.lastActivityTime = Date.now();
      if (this.isSleeping) {
        this.isSleeping = false;
      }
    };
    
    window.addEventListener('mousemove', resetActivity);
    window.addEventListener('mousedown', resetActivity);
    window.addEventListener('keydown', resetActivity);
  }
  
  update() {
    const now = Date.now();
    this.time = now / 1000;
    
    // Sleep check
    if (!this.isSleeping && (now - this.lastActivityTime) / 1000 >= Buddy.SLEEP_TIMEOUT) {
      this.isSleeping = true;
    }
    
    // Blink check (every 3-5 seconds, blink for 150ms)
    if (!this.isSleeping) {
      const timeSinceBlink = now - this.lastBlinkTime;
      if (this.isBlinking && timeSinceBlink > 150) {
        this.isBlinking = false;
        this.lastBlinkTime = now + Math.random() * 2000 + 3000;
      } else if (!this.isBlinking && timeSinceBlink > 0) {
        this.isBlinking = true;
      }
    }
    
    // State cycling (sparkle on/off)
    if (!this.isSleeping && (now - this.lastStateChange) > this.nextStateChange) {
      this.isSparkle = !this.isSparkle;
      this.lastStateChange = now;
      this.nextStateChange = this.getRandomInterval();
    }
    
    // Zzz animation phase
    if (this.isSleeping) {
      this.zzzPhase = (now % 2400) / 2400;
    }
  }
  
  drawChar(t, char, x, y) {
    t.push();
    t.translate(Math.round(x), Math.round(y));
    t.char(char);
    t.cellColor(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2]);
    t.point();
    t.pop();
  }
  
  draw(t) {
    if (!t.grid || !t.grid.cols || !t.grid.rows) return;
    
    t.charColor(CHAR_COLOR[0], CHAR_COLOR[1], CHAR_COLOR[2]);
    
    // Eyes
    if (this.isSleeping) {
      this.drawChar(t, FACE.eyeClosed, -4, -1);
      this.drawChar(t, FACE.eyeClosed, 4, -1);
    } else if (!this.isBlinking) {
      const eye = this.isSparkle ? FACE.eyeSparkle : FACE.eyeOpen;
      this.drawChar(t, eye[0], -5, -1);
      this.drawChar(t, eye[1], -4, -1);
      this.drawChar(t, eye[2], -3, -1);
      this.drawChar(t, eye[0], 3, -1);
      this.drawChar(t, eye[1], 4, -1);
      this.drawChar(t, eye[2], 5, -1);
    }
    
    // Mouth
    this.drawChar(t, FACE.mouth[0], -2, 2);
    this.drawChar(t, FACE.mouth[1], -1, 2);
    this.drawChar(t, FACE.mouth[2], 0, 2);
    this.drawChar(t, FACE.mouth[3], 1, 2);
    this.drawChar(t, FACE.mouth[4], 2, 2);
    
    // Blush (when sparkle mode)
    if (this.isSparkle && !this.isSleeping) {
      const blushAlpha = Math.floor((0.5 + Math.sin(this.time * 2) * 0.2) * 255);
      t.charColor(CHAR_COLOR[0], CHAR_COLOR[1], CHAR_COLOR[2], blushAlpha);
      this.drawChar(t, FACE.blush, -7, 0);
      this.drawChar(t, FACE.blush, 7, 0);
    }
    
    // Zzz when sleeping
    if (this.isSleeping) {
      const zzzChars = ['z', 'z', 'Z'];
      zzzChars.forEach((char, i) => {
        const delay = i * (1/3);
        const phase = (this.zzzPhase - delay + 1) % 1;
        if (phase < 0.8) {
          const alpha = Math.floor(Math.sin((phase / 0.8) * Math.PI) * 255);
          t.charColor(CHAR_COLOR[0], CHAR_COLOR[1], CHAR_COLOR[2], alpha);
          this.drawChar(t, char, 7 + i * 1.2, -3 - i * 1.5 - (phase / 0.8) * 2);
        }
      });
    }
  }
}
