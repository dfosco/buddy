/**
 * Expression definitions for Buddy
 * Each expression defines target states for eyes and mouth
 */

export const expressions = {
  neutral: {
    name: 'neutral',
    duration: 3000,
    eyes: {
      openness: 1,        // 0 = closed, 1 = fully open
      lookX: 0,           // -1 = left, 0 = center, 1 = right
      lookY: 0,           // -1 = up, 0 = center, 1 = down
      squint: 0,          // 0 = normal, 1 = fully squinted
    },
    mouth: {
      smile: 0.3,         // 0 = flat, 1 = big smile, -1 = frown
      openness: 0,        // 0 = closed, 1 = fully open
      width: 1,           // multiplier for mouth width
    },
    movement: {
      bounce: 0.3,        // amplitude of idle bounce
      speed: 1,           // speed multiplier
    }
  },

  happy: {
    name: 'happy',
    duration: 2500,
    eyes: {
      openness: 1.1,
      lookX: 0,
      lookY: -0.1,
      squint: 0.2,
    },
    mouth: {
      smile: 0.8,
      openness: 0.1,
      width: 1.1,
    },
    movement: {
      bounce: 0.5,
      speed: 1.3,
    }
  },

  curious: {
    name: 'curious',
    duration: 2800,
    eyes: {
      openness: 1.15,
      lookX: 0.6,
      lookY: -0.2,
      squint: 0,
      asymmetric: true,   // one eyebrow raised effect
    },
    mouth: {
      smile: 0.1,
      openness: 0.3,
      width: 0.7,
    },
    movement: {
      bounce: 0.2,
      speed: 0.8,
      tiltX: 0.15,        // implied head tilt
    }
  },

  sleepy: {
    name: 'sleepy',
    duration: 4000,
    eyes: {
      openness: 0.4,
      lookX: 0,
      lookY: 0.3,
      squint: 0.3,
    },
    mouth: {
      smile: 0.2,
      openness: 0,
      width: 0.9,
    },
    movement: {
      bounce: 0.15,
      speed: 0.5,
      driftY: 0.05,
    }
  },

  sleeping: {
    name: 'sleeping',
    duration: Infinity,
    eyes: {
      openness: 0,
      lookX: 0,
      lookY: 0,
      squint: 0,
    },
    mouth: {
      smile: 0.2,
      openness: 0,
      width: 0.9,
    },
    movement: {
      bounce: 0.1,
      speed: 0.3,
      driftY: 0.02,
    }
  },

  excited: {
    name: 'excited',
    duration: 2000,
    eyes: {
      openness: 1.3,
      lookX: 0,
      lookY: -0.2,
      squint: 0,
      sparkle: true,
    },
    mouth: {
      smile: 1,
      openness: 0.4,
      width: 1.2,
    },
    movement: {
      bounce: 0.7,
      speed: 1.8,
    }
  },

  thinking: {
    name: 'thinking',
    duration: 3500,
    eyes: {
      openness: 0.9,
      lookX: -0.5,
      lookY: -0.5,
      squint: 0.1,
    },
    mouth: {
      smile: 0,
      openness: 0,
      width: 0.8,
      offset: 0.2,        // slight mouth offset
    },
    movement: {
      bounce: 0.1,
      speed: 0.6,
      driftY: -0.03,
    }
  },

  wink: {
    name: 'wink',
    duration: 1500,
    eyes: {
      openness: 1,
      lookX: 0.2,
      lookY: 0,
      squint: 0,
      winkLeft: true,
    },
    mouth: {
      smile: 0.6,
      openness: 0,
      width: 1,
    },
    movement: {
      bounce: 0.3,
      speed: 1,
      tiltX: 0.1,
    }
  },

  surprised: {
    name: 'surprised',
    duration: 2000,
    eyes: {
      openness: 1.4,
      lookX: 0,
      lookY: 0,
      squint: 0,
    },
    mouth: {
      smile: 0,
      openness: 0.7,
      width: 0.6,
    },
    movement: {
      bounce: 0.4,
      speed: 1.2,
    }
  },

  lookLeft: {
    name: 'lookLeft',
    duration: 2500,
    eyes: {
      openness: 1,
      lookX: -0.8,
      lookY: 0,
      squint: 0,
    },
    mouth: {
      smile: 0.2,
      openness: 0,
      width: 1,
    },
    movement: {
      bounce: 0.2,
      speed: 0.9,
      tiltX: -0.1,
    }
  },

  lookRight: {
    name: 'lookRight',
    duration: 2500,
    eyes: {
      openness: 1,
      lookX: 0.8,
      lookY: 0,
      squint: 0,
    },
    mouth: {
      smile: 0.2,
      openness: 0,
      width: 1,
    },
    movement: {
      bounce: 0.2,
      speed: 0.9,
      tiltX: 0.1,
    }
  },
};

// Weights for random expression selection (higher = more frequent)
export const expressionWeights = {
  neutral: 0,      // neutral is the reset state, not randomly selected
  happy: 3,
  curious: 2,
  sleepy: 1,
  excited: 2,
  thinking: 2,
  wink: 1,
  surprised: 1,
  lookLeft: 2,
  lookRight: 2,
};

/**
 * Get a random expression based on weights
 */
export function getRandomExpression(exclude = null) {
  const available = Object.entries(expressionWeights)
    .filter(([name]) => name !== exclude && expressionWeights[name] > 0);
  
  const totalWeight = available.reduce((sum, [, weight]) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const [name, weight] of available) {
    random -= weight;
    if (random <= 0) {
      return expressions[name];
    }
  }
  
  return expressions.happy;
}
