// Master configuration for 9-shot story: The Exploding Whale of Florence (1970)
export const COMP_ID = 'exploding-whale';
export const FPS = 30;
export const WIDTH = 720;
export const HEIGHT = 1280;
export const DURATION_S = 49.10;

// Shot boundary timestamps (seconds) matching audio/timing.json exactly
export const CUTS = [
  0.0,    // Shot 1 (0.00 - 4.08s, 122 frames)
  4.08,   // Shot 2 (4.08 - 8.34s, 128 frames)
  8.34,   // Shot 3 (8.34 - 14.88s, 196 frames)
  14.88,  // Shot 4 (14.88 - 20.74s, 176 frames)
  20.74,  // Shot 5 (20.74 - 26.82s, 182 frames)
  26.82,  // Shot 6 (26.82 - 32.28s, 164 frames)
  32.28,  // Shot 7 (32.28 - 39.34s, 212 frames)
  39.34,  // Shot 8 (39.34 - 44.28s, 148 frames)
  44.28   // Shot 9 (44.28 - 49.10s, 145 frames)
];

// All 9 shots with continuous camera push/moves, exact coordinates from script/camera_plan.md
export const SHOTS = [
  // Shot 1: George packing dynamite under whale (x = 0)
  // Low-angle creeping dolly push-in: 1.81m / 0.44 m/s (5.2 px/f)
  {
    id: 'shot1',
    x: 0,
    fog: '#baa893',
    beats: [0.0, 2.04, 4.08],
    pos: [
      [0.00, 1.45, 6.20],
      [0.03, 1.38, 5.30],
      [0.06, 1.30, 4.40]
    ],
    look: [
      [0.05, 1.15, 0.70],
      [0.05, 1.15, 0.70],
      [0.05, 1.15, 0.70]
    ]
  },

  // Shot 2: Crowd holding noses around rotting carcass (x = 40)
  // High-to-medium descending crane push-in: 2.42m / 0.57 m/s (5.8 px/f)
  {
    id: 'shot2',
    x: 40,
    fog: '#baa893',
    beats: [4.08, 6.21, 8.34],
    pos: [
      [40.00, 2.10, 7.20],
      [40.00, 1.70, 6.10],
      [40.00, 1.34, 4.90]
    ],
    look: [
      [40.00, 1.15, 0.60],
      [40.00, 1.15, 0.60],
      [40.00, 1.15, 0.60]
    ]
  },

  // Shot 3: George with whiteboard plan and seagulls (x = 80)
  // 3/4 orbital arc tracking push-in: 1.85m / 0.28 m/s (4.6 px/f)
  {
    id: 'shot3',
    x: 80,
    fog: '#baa893',
    beats: [8.34, 11.61, 14.88],
    pos: [
      [79.80, 1.48, 5.80],
      [80.15, 1.40, 4.90],
      [80.50, 1.32, 4.10]
    ],
    look: [
      [80.15, 1.28, 0.30],
      [80.15, 1.28, 0.30],
      [80.15, 1.28, 0.30]
    ]
  },

  // Shot 4: Veteran pleading before towering dynamite crates (x = 120)
  // Low-angle upward-tilted tracking push-in: 1.85m / 0.32 m/s (4.9 px/f)
  {
    id: 'shot4',
    x: 120,
    fog: '#c5a388',
    beats: [14.88, 17.81, 20.74],
    pos: [
      [119.80, 1.45, 5.80],
      [120.00, 1.38, 4.85],
      [120.20, 1.30, 4.00]
    ],
    look: [
      [120.00, 1.35, 0.20],
      [120.00, 1.35, 0.20],
      [120.00, 1.35, 0.20]
    ]
  },

  // Shot 5: George behind barricade gripping plunger (x = 160)
  // Low-profile lateral tracking push-in: 1.93m / 0.32 m/s (5.1 px/f)
  {
    id: 'shot5',
    x: 160,
    fog: '#baa893',
    beats: [20.74, 23.78, 26.82],
    pos: [
      [159.80, 1.46, 5.40],
      [160.00, 1.38, 4.40],
      [160.15, 1.28, 3.50]
    ],
    look: [
      [160.10, 1.05, 0.75],
      [160.10, 1.05, 0.75],
      [160.10, 1.05, 0.75]
    ]
  },

  // Shot 6: Massive explosion plume on beach (x = 200)
  // High-speed skyward crane ascent + shockwave tremor: 3.77m / 0.69 m/s (6.5 px/f)
  {
    id: 'shot6',
    x: 200,
    fog: '#baa893',
    beats: [26.82, 29.55, 32.28],
    pos: [
      [200.00, 1.80, 13.50],
      [200.00, 2.40, 11.80],
      [200.00, 3.20, 10.00]
    ],
    look: [
      [200.00, 4.20, -2.00],
      [200.00, 4.20, -2.00],
      [200.00, 4.20, -2.00]
    ]
  },

  // Shot 7: Shocked crowd looking up as blubber rains (x = 240)
  // Low-angle upward-angled push-in: 2.21m / 0.31 m/s (4.8 px/f)
  {
    id: 'shot7',
    x: 240,
    fog: '#b3a493',
    beats: [32.28, 35.81, 39.34],
    pos: [
      [240.00, 1.30, 6.40],
      [240.00, 1.22, 5.30],
      [240.00, 1.15, 4.20]
    ],
    look: [
      [240.00, 1.75, 0.60],
      [240.00, 1.75, 0.60],
      [240.00, 1.75, 0.60]
    ]
  },

  // Shot 8: Coffee-table slab crushing brand new sedan (x = 280)
  // Descending 3/4 orbital crane drop + slam: 2.25m / 0.46 m/s (5.5 px/f)
  {
    id: 'shot8',
    x: 280,
    fog: '#baa893',
    beats: [39.34, 41.81, 44.28],
    pos: [
      [279.70, 1.65, 6.40],
      [279.95, 1.45, 5.30],
      [280.20, 1.25, 4.20]
    ],
    look: [
      [280.05, 0.85, 0.00],
      [280.05, 0.85, 0.00],
      [280.05, 0.85, 0.00]
    ]
  },

  // Shot 9: Veteran standing beside crushed car holding keys (x = 320)
  // Low-angle comedic ease-in push: 1.83m / 0.38 m/s (5.0 px/f)
  {
    id: 'shot9',
    x: 320,
    fog: '#baa893',
    beats: [44.28, 46.69, 49.10],
    pos: [
      [319.90, 1.44, 5.80],
      [320.05, 1.36, 4.90],
      [320.20, 1.26, 4.00]
    ],
    look: [
      [320.00, 1.05, 0.40],
      [320.00, 1.05, 0.40],
      [320.00, 1.05, 0.40]
    ]
  }
];

export const CREAM = '#f3e7cf';
