// Master configuration for 9-shot story: The Exploding Whale of Florence (1970)
export const COMP_ID = 'exploding-whale';
export const FPS = 30;
export const WIDTH = 720;
export const HEIGHT = 1280;
export const DURATION_S = 49.10;

// Shot boundary timestamps (seconds) matching audio/timing.json exactly
export const CUTS = [
  0.0,    // Shot 1 (0.00 - 4.08s)
  4.08,   // Shot 2 (4.08 - 8.34s)
  8.34,   // Shot 3 (8.34 - 14.88s)
  14.88,  // Shot 4 (14.88 - 20.74s)
  20.74,  // Shot 5 (20.74 - 26.82s)
  26.82,  // Shot 6 (26.82 - 32.28s)
  32.28,  // Shot 7 (32.28 - 39.34s)
  39.34,  // Shot 8 (39.34 - 44.28s)
  44.28   // Shot 9 (44.28 - 49.10s)
];

// All 9 shots with continuous camera push/moves and easing
export const SHOTS = [
  // Shot 1: George packing dynamite under whale (x = 0)
  {
    id: 'shot1',
    x: 0,
    fog: '#baa893',
    beats: [0.0, 2.04, 4.08],
    pos: [
      [0.0, 1.45, 6.2],
      [0.03, 1.38, 5.3],
      [0.06, 1.32, 4.5]
    ],
    look: [
      [0.0, 1.15, 0.5],
      [0.0, 1.15, 0.5],
      [0.0, 1.15, 0.5]
    ]
  },

  // Shot 2: Crowd holding noses around rotting carcass (x = 40)
  {
    id: 'shot2',
    x: 40,
    fog: '#baa893',
    beats: [4.08, 6.21, 8.34],
    pos: [
      [40.0, 1.48, 6.6],
      [40.0, 1.40, 5.8],
      [40.0, 1.34, 5.0]
    ],
    look: [
      [40.0, 1.15, 0.6],
      [40.0, 1.15, 0.6],
      [40.0, 1.15, 0.6]
    ]
  },

  // Shot 3: George with whiteboard plan and seagulls (x = 80)
  {
    id: 'shot3',
    x: 80,
    fog: '#baa893',
    beats: [8.34, 11.61, 14.88],
    pos: [
      [80.15, 1.46, 5.8],
      [80.15, 1.40, 5.0],
      [80.15, 1.34, 4.2]
    ],
    look: [
      [80.15, 1.32, 0.3],
      [80.15, 1.32, 0.3],
      [80.15, 1.32, 0.3]
    ]
  },

  // Shot 4: Veteran pleading before towering dynamite crates (x = 120)
  {
    id: 'shot4',
    x: 120,
    fog: '#c5a388',
    beats: [14.88, 17.81, 20.74],
    pos: [
      [120.0, 1.45, 5.8],
      [120.0, 1.38, 4.9],
      [120.0, 1.32, 4.1]
    ],
    look: [
      [120.0, 1.25, 0.3],
      [120.0, 1.25, 0.3],
      [120.0, 1.25, 0.3]
    ]
  },

  // Shot 5: George behind barricade gripping plunger (x = 160)
  {
    id: 'shot5',
    x: 160,
    fog: '#baa893',
    beats: [20.74, 23.78, 26.82],
    pos: [
      [160.0, 1.45, 5.2],
      [160.0, 1.38, 4.4],
      [160.0, 1.30, 3.6]
    ],
    look: [
      [160.0, 1.05, 0.7],
      [160.0, 1.05, 0.7],
      [160.0, 1.05, 0.7]
    ]
  },

  // Shot 6: Massive explosion plume on beach (x = 200)
  {
    id: 'shot6',
    x: 200,
    fog: '#baa893',
    beats: [26.82, 29.55, 32.28],
    pos: [
      [200.0, 2.0, 13.5],
      [200.0, 2.3, 12.0],
      [200.0, 2.6, 10.5]
    ],
    look: [
      [200.0, 4.0, -2.0],
      [200.0, 4.3, -2.0],
      [200.0, 4.6, -2.0]
    ]
  },

  // Shot 7: Shocked crowd looking up as blubber rains (x = 240)
  {
    id: 'shot7',
    x: 240,
    fog: '#b3a493',
    beats: [32.28, 35.81, 39.34],
    pos: [
      [240.0, 1.25, 6.2],
      [240.0, 1.20, 5.3],
      [240.0, 1.15, 4.4]
    ],
    look: [
      [240.0, 1.7, 0.7],
      [240.0, 1.7, 0.7],
      [240.0, 1.7, 0.7]
    ]
  },

  // Shot 8: Coffee-table slab crushing brand new sedan (x = 280)
  {
    id: 'shot8',
    x: 280,
    fog: '#baa893',
    beats: [39.34, 41.81, 44.28],
    pos: [
      [280.0, 1.42, 6.2],
      [280.0, 1.34, 5.2],
      [280.0, 1.26, 4.3]
    ],
    look: [
      [280.0, 0.85, 0.1],
      [280.0, 0.85, 0.1],
      [280.0, 0.85, 0.1]
    ]
  },

  // Shot 9: Veteran standing beside crushed car holding keys (x = 320)
  {
    id: 'shot9',
    x: 320,
    fog: '#baa893',
    beats: [44.28, 46.69, 49.10],
    pos: [
      [320.1, 1.42, 5.8],
      [320.1, 1.35, 5.0],
      [320.1, 1.28, 4.2]
    ],
    look: [
      [320.1, 1.10, 0.4],
      [320.1, 1.10, 0.4],
      [320.1, 1.10, 0.4]
    ]
  }
];

export const CREAM = '#f3e7cf';
