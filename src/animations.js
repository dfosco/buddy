/**
 * Animation utilities for Buddy
 */

/**
 * Easing functions
 */
export const easing = {
  // Smooth ease in-out
  easeInOutCubic: (t) => t < 0.5 
    ? 4 * t * t * t 
    : 1 - Math.pow(-2 * t + 2, 3) / 2,
  
  // Bouncy ease out
  easeOutBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  
  // Elastic bounce
  easeOutElastic: (t) => {
    if (t === 0 || t === 1) return t;
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
  },
  
  // Simple ease out
  easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
  
  // Smooth step
  smoothstep: (t) => t * t * (3 - 2 * t),
};

/**
 * Linear interpolation
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Interpolate between two expression states
 */
export function lerpExpression(from, to, t, easingFn = easing.easeInOutCubic) {
  const easedT = easingFn(t);
  
  return {
    eyes: {
      openness: lerp(from.eyes.openness, to.eyes.openness, easedT),
      lookX: lerp(from.eyes.lookX, to.eyes.lookX, easedT),
      lookY: lerp(from.eyes.lookY, to.eyes.lookY, easedT),
      squint: lerp(from.eyes.squint, to.eyes.squint, easedT),
      asymmetric: to.eyes.asymmetric || false,
      winkLeft: to.eyes.winkLeft || false,
      sparkle: to.eyes.sparkle || false,
    },
    mouth: {
      smile: lerp(from.mouth.smile, to.mouth.smile, easedT),
      openness: lerp(from.mouth.openness, to.mouth.openness, easedT),
      width: lerp(from.mouth.width, to.mouth.width, easedT),
      offset: lerp(from.mouth.offset || 0, to.mouth.offset || 0, easedT),
    },
    movement: {
      bounce: lerp(from.movement.bounce, to.movement.bounce, easedT),
      speed: lerp(from.movement.speed, to.movement.speed, easedT),
      tiltX: lerp(from.movement.tiltX || 0, to.movement.tiltX || 0, easedT),
      driftY: lerp(from.movement.driftY || 0, to.movement.driftY || 0, easedT),
    },
  };
}

/**
 * Create a periodic bounce animation value
 */
export function bounce(time, amplitude = 1, frequency = 1, phase = 0) {
  return amplitude * Math.sin(time * frequency * Math.PI * 2 + phase);
}

/**
 * Create smooth noise-like movement
 */
export function smoothNoise(time, seed = 0) {
  // Simple smooth pseudo-random using multiple sine waves
  return (
    Math.sin(time * 0.7 + seed) * 0.5 +
    Math.sin(time * 1.3 + seed * 2) * 0.3 +
    Math.sin(time * 2.1 + seed * 3) * 0.2
  );
}

/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
