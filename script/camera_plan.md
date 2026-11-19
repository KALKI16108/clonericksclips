# Master Camera Plan & 3D Spatial Staging: The Exploding Whale (1970)

**Project**: The Exploding Whale (Florence, Oregon, November 12, 1970)  
**Format**: 9:16 Vertical Short (720 × 1280 @ 30.0 fps)  
**Total Runtime**: 49.10 seconds (1,473 frames)  
**Script Source**: `script/script_final.md`  
**Audio & Timing Source**: `audio/timing.json`  
**Production Standard**: Continuous 3D Three.js camera travel, 3-tier depth staging, painted low-poly textures with ink outlines (`#351f22` / `#24231f`), and 100% in-world physical signage.

---

## 1. Master Technical & Cinematographic Architecture

### 1.1 Technical Specifications & Render Constraints
* **Resolution & Aspect Ratio**: 720 × 1280 pixels (9:16 vertical orientation).
* **Framerate**: 30.0 fps constant (frame-accurate timing synchronized with `audio/timing.json`).
* **Camera Sensor / Optics**: Virtual 3D Perspective Camera, Vertical Field of View (FOV) = **38.0° – 40.0°** (~45mm full-frame focal length equivalent for natural vertical compression without fisheye barrel distortion).
* **Rendering Engine**: Three.js WebGL / Remotion compositor.
* **Lighting Model**:
  - `HemisphereLight`: Sky color `#fffaf0`, Ground bounce `#b8b0a2`, intensity `0.92`.
  - `DirectionalLight` (Key Sun): Upper-left `[-4.0, 8.0, 5.0]`, color `#fcf6ea`, intensity `1.15`, shadow map `2048 × 2048` with `PCFSoftShadowMap`.
  - Atmospheric Fog: Distance-based exponential/linear fog (`#baa893` to `#c5a388`), providing natural aerial perspective and depth separation.

### 1.2 Zero Static Holds — 100% Continuous 3D Camera Travel
In strict accordance with the quantitative video analysis in `analysis/rulebook.md` (which demonstrated active camera motion across 70.3%–95.1% of frames at 4.5–6.5 px/frame):
* **No Frozen Frames**: Every shot exhibits non-zero 3D camera translation throughout its entire duration.
* **Camera Motions Employed**: Low-angle creeping push-ins, tracking dollies, 3/4 orbital arcs, descending crane plunges, and skyward ascents.
* **Motion Continuity**: Camera paths utilize smooth Catmull-Rom cubic splines (`samplePath`) parameterized by normalized monotonic time warps (`warpU`), ensuring smooth acceleration and zero mechanical stops.
* **Physical Speed Calibrations**: Average translation speed is calibrated between **0.25 m/s and 0.70 m/s** in world space, corresponding to **4.5 – 6.5 pixels/frame** of background flow at 720p.

### 1.3 Volumetric 3D Environments (Zero Flat Cardboard Strips)
* **True 3D Geometry**: Every environment (beach shoreline, spectator dunes, briefing staging, blast barricade, parking lot) is built from procedural Three.js 3D meshes (extruded contours, subdivided terrain, beached whale hull, 3D vehicles, timber barricades, wooden crates).
* **Stylized Surface Polish**: Satin-vinyl `MeshPhysicalMaterial` (`roughness: 0.48`, `clearcoat: 0.42`, `reflectivity: 0.45`) with painted brush textures, stains, and subtle wood grain scratches.
* **Dark Ink Silhouette Outlines**: Every object and character is enclosed in smooth, outward-normal Catmull-Rom ink outlines using `#351f22` and `#24231f` (warm dark charcoal/sepia, never pure digital `#000000`).

### 1.4 Three-Tier Depth Staging Architecture
Every shot is composed with three distinct, active depth planes:
1. **Foreground (Z: +1.2m to +2.8m from stage center)**: Environmental props (driftwood logs, swaying marram sea grass, barrier ropes, detonator cables, shattered debris) positioned close to the camera lens. As the camera translates, these foreground assets sweep across frame edges, generating powerful motion parallax.
2. **Midground (Z: -0.2m to +1.0m)**: Primary acting zone. Characters (George, Veteran, Town Spectators) staged in medium or close-up framing (occupying 35% to 50% of vertical screen height), allowing facial expressions, hand gestures, and body language to be clearly read.
3. **Background (Z: -2.0m to -15.0m)**: Contextual world architecture (the rotting whale hull, sand dunes, Pacific ocean surf, military tents, coastal highway poles, cloudy skies) with atmospheric fog and subtle optical bokeh falloff.

### 1.5 100% In-World Physical Signage Protocol
* **Zero Floating HUD Overlays**: All textual storytelling, titles, warnings, and labels are physically embedded inside the 3D scene as tangible world props.
* **Signage Typologies**:
  - Weathered painted wooden boards and carved boundary markers.
  - Stenciled military/industrial text on red explosive crates.
  - Hand-drawn ink whiteboard diagrams.
  - Cast brass manufacturer plates on machinery.
  - Stamped metal license plates and bumper stickers on vehicles.

---

## 2. Master Shot Matrix & Timeline Overview

| Shot | Time (s) | Dur (s) | Frames | Voiceover Dialogue Summary | 3D Location & X-Offset | Camera Movement Type | Travel Dist / Velocity | Primary Framing | In-World Physical Sign |
| :---: | :---: | :---: | :---: | :--- | :--- | :--- | :---: | :--- | :--- |
| **01** | `0.00 - 4.08` | 4.08s | 122f | *"A highway engineer packed a dead whale with half a ton of dynamite."* | South Jetty Beach (`x = 0`) | Low-Angle Creeping Push-In | 1.81m / 0.44 m/s (5.2 px/f) | Medium-Close (George crouching) | Stenciled Crate: `"DANGER - HIGH EXPLOSIVES"` |
| **02** | `4.08 - 8.34` | 4.26s | 128f | *"You see, in 1970, an eight-ton whale washed up rotting on an Oregon beach."* | Foggy Coastline Dune (`x = 40`) | Descending Crane Push-In | 2.42m / 0.57 m/s (5.8 px/f) | Medium Three-Shot (Nose-pinching crowd) | Painted Coastal Board: `"BEACH CLOSED - ROTTING CARCASS"` |
| **03** | `8.34 - 14.88` | 6.54s | 196f | *"Nobody knew how to move it, so George figures if you blow it to bits..."* | Dune Briefing Area (`x = 80`) | 3/4 Tracking Arc Dolly | 1.85m / 0.28 m/s (4.6 px/f) | Medium Shot (George + Whiteboard) | Whiteboard Plan: `"OPERATION WHALE DISPOSAL"` |
| **04** | `14.88 - 20.74` | 5.86s | 176f | *"A military veteran in town begs him to stop, saying twenty cases..."* | Munitions Staging Depot (`x = 120`) | Low-Angle Upward Tilt Push-In | 1.85m / 0.32 m/s (4.9 px/f) | Medium Close-Up (Frantic Veteran) | Stenciled Crates: `"DYNAMITE 40% - 20 CASES (1,000 LBS)"` |
| **05** | `20.74 - 26.82` | 6.08s | 182f | *"George laughs, buries the dynamite anyway, and walks a quarter-mile..."* | Highway Barricade (`x = 160`) | Lateral Tracking Push-In | 1.93m / 0.32 m/s (5.1 px/f) | Medium Close-Up (George on Plunger) | Brass Plunger Plate: `"DU PONT BLASTING MACHINE NO. 3"` |
| **06** | `26.82 - 32.28` | 5.46s | 164f | *"The explosion shakes the ground and launches a massive cloud..."* | Blast Ground Zero (`x = 200`) | Skyward Crane Ascent + Shake | 3.77m / 0.69 m/s (6.5 px/f) | Wide Environmental Plume | Tumbling Signboard: `"FLORENCE PUBLIC BEACH"` |
| **07** | `32.28 - 39.34` | 7.06s | 212f | *"For three seconds, it's completely silent. Then, chunks of blubber..."* | Spectator Viewing Ridge (`x = 240`) | Upward-Angled Dolly Push-In | 2.21m / 0.31 m/s (4.8 px/f) | Medium Three-Shot (Shocked Faces) | Wooden Directional Fingerpost: `"[->] PARKING LOT"` |
| **08** | `39.34 - 44.28` | 4.94s | 148f | *"A slab the size of a coffee table drops straight down and flattens..."* | Parking Lot Sedan Site (`x = 280`) | 3/4 Orbital Crane Drop + Slam | 2.25m / 0.46 m/s (5.5 px/f) | Medium Vehicle Showcase | Rear Window Sticker: `"WALT PEFFER MOTORS - A WHALE OF A DEAL!"` |
| **09** | `44.28 - 49.10` | 4.82s | 145f | *"It belonged to the veteran, who'd just bought it on a sale..."* | Crushed Car Aftermath (`x = 320`) | Low-Angle Comedic Push-In | 1.83m / 0.38 m/s (5.0 px/f) | Close Two-Shot (Veteran + Seagull) | Dealership Billboard: `"WALT PEFFER BUICK - A WHALE OF A DEAL"` |

---

## 3. Shot-by-Shot Detailed Cinematography Plans

---

### Shot 1: The Engineer's Scheme
* **Shot Number**: 1
* **Timeline**: `0.00s` – `4.08s` (Duration: `4.08s`, `122 frames` @ 30 fps)  
  *(Audio voiceover active from `0.00s` to `3.30s`)*
* **Voiceover Line**:  
  > *"A highway engineer packed a dead whale with half a ton of dynamite."*
* **3D Environment & World Location**:  
  - Location: South Jetty Beach, Florence, Oregon (World origin `x = 0.00`).
  - Terrain: Low-poly undulating damp beach sand (`#c5a378`), wet tidal reflections near shoreline, scattered driftwood logs, clumps of coarse marram sea grass.
  - Atmosphere: Pale coastal morning haze, soft cream overcast sky (`#ded9cf`), warm sand fog (`#baa893`, near `8m`, far `25m`).
* **Key 3D Prop Assets**:
  - Open red wooden munitions crate (`0.65m × 0.40m × 0.45m`, painted crimson `#b8423f` with dark wood grain wear).
  - 5 cylindrical red dynamite sticks (`#e5525b`, length `0.35m`, diameter `0.08m`, wrapped with paper seams and white fuses).
  - Massive low-poly beached sperm whale hull (`1.2m` radius, `6.5m` length, slate-charcoal `#443e40` with dark ink ribs and liver spots).
* **3D Camera Coordinates & Travel Path**:
  - Camera Start `[x, y, z]`: `[0.00, 1.45, 6.20]`
  - Camera Midpoint `[x, y, z]`: `[0.03, 1.38, 5.30]`
  - Camera End `[x, y, z]`: `[0.06, 1.30, 4.40]`
  - LookAt Target `[x, y, z]`: `[0.05, 1.15, 0.70]` (tracking George and the dynamite crate)
  - Camera Motion Type: Low-angle creeping dolly push-in with gentle rightward lateral drift.
  - Physical Travel Distance: `1.81 meters`  
  - Physical Speed: `0.44 m/s` (~`5.2 pixels/frame` at 720p).
* **3-Tier Depth Staging Breakdown**:
  - **Foreground (`z = +2.0m` to `+2.8m`)**: Heavy weathered driftwood log on the right side and swaying tall beach grass on the left slicing across frame edges, producing rapid lateral parallax.
  - **Midground (`z = +0.70m` to `+1.10m`)**: George the Highway Engineer (`z = 0.80m`), kneeling on the sand, sliding a red dynamite stick beneath the whale carcass. Open dynamite crate sits at `z = 0.95m`.
  - **Background (`z = -2.40m` to `-10.0m`)**: The gargantuan beached whale carcass resting heavy in the wet sand, distant breaking ocean surf, and foggy coastal dunes fading into sand fog.
* **In-World Physical Signage**:
  - Primary Sign: Weathered stencil on the face of the red wooden dynamite crate in bold black block lettering:  
    `"DANGER — HIGH EXPLOSIVES — 50 LBS"`.
  - Secondary Environmental Marker: Carved wooden beach post staked in the sand at `z = 1.2m`:  
    `"OREGON HWY DEPT — DIST. 4"`.
* **Character Framing & Performance**:
  - Character: George (State Highway Engineer).
  - Outfit & Palette: Chibi stylized cutout stick figure (`characterCore.js` standard, 1:3.6 head-to-body ratio), high-visibility neon-orange highway vest over white work shirt, dark charcoal trousers, yellow safety hardhat (`#e0a32e`).
  - Scale & Framing: Medium-close framing (character occupies ~42% vertical screen height).
  - Expression & Action: Focused, self-satisfied grin (`expression: 'grin'`), circular pad hands carefully sliding dynamite sticks into a trench beneath the whale's flukes.

---

### Shot 2: The Stinking Spectacle
* **Shot Number**: 2
* **Timeline**: `4.08s` – `8.34s` (Duration: `4.26s`, `128 frames` @ 30 fps)  
  *(Audio voiceover active from `4.08s` to `8.34s`)*
* **Voiceover Line**:  
  > *"You see, in 1970, an eight-ton whale washed up rotting on an Oregon beach."*
* **3D Environment & World Location**:  
  - Location: Beach Crowd Barrier & Dune Overlook (World offset `x = 40.00`).
  - Terrain: Sloped dune ridge dropping down toward the shoreline, damp grey-brown sand (`#baa893`).
  - Atmosphere: Thick coastal sea mist and visible brownish-green putrid stench vapours rising in curly ribbons from the carcass.
* **Key 3D Prop Assets**:
  - Rotting 8-ton sperm whale carcass (`1.3m` radius, `6.8m` length, mottled rotting grey `#3d3739` with darker decay blotches and deep `#24231f` ink creases).
  - 3 stylized vertical wavy stink-plumes (`0.08m` thick, color `#847864`, swaying gently).
  - Wooden crowd control barrier posts connected by yellow twisted hazard rope.
* **3D Camera Coordinates & Travel Path**:
  - Camera Start `[x, y, z]`: `[40.00, 2.10, 7.20]` (elevated high-angle overview)
  - Camera Midpoint `[x, y, z]`: `[40.00, 1.70, 6.10]`
  - Camera End `[x, y, z]`: `[40.00, 1.34, 4.90]` (descending into eye-level crowd intimacy)
  - LookAt Target `[x, y, z]`: `[40.00, 1.15, 0.60]` (centered on the spectators' suffering faces)
  - Camera Motion Type: High-to-medium descending crane push-in.
  - Physical Travel Distance: `2.42 meters`  
  - Physical Speed: `0.57 m/s` (~`5.8 pixels/frame` at 720p).
* **3-Tier Depth Staging Breakdown**:
  - **Foreground (`z = +2.2m` to `+2.8m`)**: Yellow twisted hazard rope strung between weathered wooden posts passing diagonally across the bottom frame, with weathered dune snow-fence wooden slats on the left.
  - **Midground (`z = +0.85m` to `+1.05m`)**: Tight three-character group staged across the 9:16 vertical frame:
    * Left: Town Clerk (`x = 39.15m`, bowler hat `#2d2d23`, tweed suit).
    * Center: Town Mayor/Boss (`x = 40.00m`, black top hat, round spectacles).
    * Right: Coastal Laborer (`x = 40.85m`, flat wool newsboy cap, work overalls).
    All three pinch their faces in comical revulsion.
  - **Background (`z = -3.20m` to `-12.0m`)**: The bloated, decaying whale carcass with green-brown stink fumes wafting high into the overcast sky, fog-shrouded ocean surf in the distance.
* **In-World Physical Signage**:
  - Weathered white-painted wooden coastal notice board staked beside the crowd barrier:  
    `"NOTICE — BEACH CLOSED — ROTTING CARCASS — BIO HAZARD"`.  
    Paint is peeled and splattered with sand spray.
* **Character Framing & Performance**:
  - Framing: Medium three-shot (trio occupies 45% screen width and 38% screen height).
  - Expression: Comically extreme disgust (`expression: 'sweat' / 'shock'`). Circular pad hands clamped firmly over their non-existent noses, eyes squeezed into watery crescents, sweat beads popping off temples.

---

### Shot 3: George's Flawless Seagull Plan
* **Shot Number**: 3
* **Timeline**: `8.34s` – `14.88s` (Duration: `6.54s`, `196 frames` @ 30 fps)  
  *(Audio voiceover active from `8.34s` to `14.88s`)*
* **Voiceover Line**:  
  > *"Nobody knew how to move it, so George figures if you blow it to bits, the seagulls will just eat whatever's left."*
* **3D Environment & World Location**:  
  - Location: Dune Briefing Area & Sand Ridge (World offset `x = 80.00`).
  - Terrain: Hard-packed sand platform on an elevated dune overlooking the beach, marram grass tufts.
  - Atmosphere: Crisp coastal sunlight cutting through thinning marine layer, bright highlights (`#cec4b4`), crisp shadows (`#2a3026`).
* **Key 3D Prop Assets**:
  - Portable wooden-framed chalkboard/whiteboard on an easel (`2.1m × 1.05m`, frame `#5c4f3e`, board face `#f4efe6`).
  - Wooden survey tripod with brass transit level.
  - Natural sand mound / dune crest on stage right (`radius 1.6m`, height `0.85m`).
  - 2 low-poly stylized seagulls (white cones, grey wings `#686c75`, yellow cone beaks `#d4a037`, black ink outlines).
* **3D Camera Coordinates & Travel Path**:
  - Camera Start `[x, y, z]`: `[79.80, 1.48, 5.80]`
  - Camera Midpoint `[x, y, z]`: `[80.15, 1.40, 4.90]`
  - Camera End `[x, y, z]`: `[80.50, 1.32, 4.10]`
  - LookAt Target `[x, y, z]`: `[80.15, 1.28, 0.30]` (centered between George and the whiteboard)
  - Camera Motion Type: 3/4 orbital arc tracking push-in with gentle left-to-right swing.
  - Physical Travel Distance: `1.85 meters`  
  - Physical Speed: `0.28 m/s` (~`4.6 pixels/frame` at 720p).
* **3-Tier Depth Staging Breakdown**:
  - **Foreground (`z = +1.8m` to `+2.4m`)**: Survey tripod legs framing the lower-left corner; foreground dune grass blades swaying gently across the camera lens.
  - **Midground (`z = +0.85m` to `-0.30m`)**:
    * Left Midground (`x = 79.30m, z = 0.85m`): George standing tall in his orange vest and hardhat, proudly holding a wooden pointing stick.
    * Center-Right Midground (`x = 80.65m, z = -0.30m`): The large whiteboard on an easel displaying the tactical diagram.
  - **Background (`z = -0.60m` to `-2.5m`)**: Sand dune crest with two stylized seagulls standing motionless, staring blankly with unblinking dot eyes at George, pale coastal sky.
* **In-World Physical Signage**:
  - Whiteboard Technical Diagram: Illustrated in crude hand-drawn black and red ink lines directly on the whiteboard surface:  
    * Top Title: `"OPERATION WHALE DISPOSAL"`  
    * Diagram: A cartoon side-profile drawing of a whale + a stick of dynamite with a burning fuse `->` a jagged comic explosion burst `[KA-BOOM!]` `->` radiating dotted arrows pointing to two stick seagulls eating tiny speckles labeled:  
      `"CLEANUP CREW (FREE)"`.
* **Character Framing & Performance**:
  - Framing: Medium two-shot (George on left, whiteboard on right, framed from waist up, occupying 45% screen height).
  - Expression: George radiates supreme overconfidence (`expression: 'smug' / 'grin'`). Arm actively taps the pointer against the explosion burst.
  - Seagulls: Totally deadpan, round black pupil dots, tilting heads by 5° at frame 90.

---

### Shot 4: The Veteran's Warning
* **Shot Number**: 4
* **Timeline**: `14.88s` – `20.74s` (Duration: `5.86s`, `176 frames` @ 30 fps)  
  *(Audio voiceover active from `14.88s` to `20.74s`)*
* **Voiceover Line**:  
  > *"A military veteran in town begs him to stop, saying twenty cases of dynamite is completely insane."*
* **3D Environment & World Location**:  
  - Location: Munitions Staging Depot / Supply Staging Area (World offset `x = 120.00`).
  - Terrain: Sand trampled with tire tracks, olive-drab canvas army supply tents, rows of burlap sandbags.
  - Atmosphere: Dusty, dry ochre atmosphere (`#c5a388`), high-contrast tension lighting, harsh directional shadows.
* **Key 3D Prop Assets**:
  - An absurdly tall pyramid of 20 wooden dynamite crates stacked in 5 tiers (`each crate 0.65m × 0.45m × 0.55m`, painted deep crimson `#c43e38`, rising over 2.5 meters tall).
  - Military metal jerrycan (`#4a5340`) and coiled rope on sand.
  - Edge of military canvas marquee tent with wooden support poles.
* **3D Camera Coordinates & Travel Path**:
  - Camera Start `[x, y, z]`: `[119.80, 1.45, 5.80]`
  - Camera Midpoint `[x, y, z]`: `[120.00, 1.38, 4.85]`
  - Camera End `[x, y, z]`: `[120.20, 1.30, 4.00]`
  - LookAt Target `[x, y, z]`: `[120.00, 1.35, 0.20]` (tilting up toward the towering crate pyramid and Veteran's face)
  - Camera Motion Type: Low-angle upward-tilted tracking push-in.
  - Physical Travel Distance: `1.85 meters`  
  - Physical Speed: `0.32 m/s` (~`4.9 pixels/frame` at 720p).
* **3-Tier Depth Staging Breakdown**:
  - **Foreground (`z = +2.0m` to `+2.6m`)**: Canvas tent guy-rope and steel tent stake in lower-left; olive-drab jerrycan resting in sand in lower-right foreground.
  - **Midground (`z = +0.85m`)**: The Military Veteran (`x = 119.65m`), wearing an olive M-65 field jacket (`#4b5320`), fatigue cap, and dog tags. Waves both arms frantically in the air, gesticulating wildly toward the crates.
  - **Background (`z = -0.30m` to `-3.0m`)**: The towering, precarious 20-case dynamite pyramid towering ominously behind him, canvas supply tent walls, sandbag barricades.
* **In-World Physical Signage**:
  - Stenciled Crate Text: Bold black stencil on every single wooden crate face:  
    `"DYNAMITE 40% — 20 CASES — (1,000 LBS NET)"`.
  - Staked Military Warning Sign: Yellow painted wooden board staked into sandbags:  
    `"EXPLOSIVES DEPOT — NO SMOKING — AUTHORIZED PERSONNEL ONLY"`.
* **Character Framing & Performance**:
  - Character: Military Veteran (Walt Peffer).
  - Framing: Medium close-up (waist-up, occupying 46% vertical screen height).
  - Expression & Animation: Frantic agitation (`expression: 'shout' / 'sweat'`). Eyes widened into huge white circles, mouth snapping wide in desperate warning, arms flailing upward and pointing behind him at the monstrous crate stack. Subtle purple anger/frustration tint rising to 0.65 on cranial contour.

---

### Shot 5: The Quarter-Mile Barricade
* **Shot Number**: 5
* **Timeline**: `20.74s` – `26.82s` (Duration: `6.08s`, `182 frames` @ 30 fps)  
  *(Audio voiceover active from `20.74s` to `26.82s`)*
* **Voiceover Line**:  
  > *"George laughs, buries the dynamite anyway, and walks a quarter-mile down the road to push the plunger."*
* **3D Environment & World Location**:  
  - Location: Blast Control Barricade on Highway 101 (World offset `x = 160.00`).
  - Terrain: Asphalt roadway edge with white painted stripe, concrete highway barrier, sandy road shoulder.
  - Atmosphere: Cool marine layer returning, ocean breeze, soft coastal fog (`#baa893`).
* **Key 3D Prop Assets**:
  - Heavy cast-concrete highway crash barrier (`2.6m` long, `0.85m` high, `#cec4b4` with road grime textures and dark ink outlines).
  - Antique oak-cased blasting machine box (`0.28m × 0.35m × 0.28m`, dark varnished wood `#6b4a2e`, brass corner brackets).
  - Vertical steel rack-and-pinion plunger rod with horizontal wooden T-handle (`#2d2d23`).
  - Thick black twin-lead detonator cable (`0.03m` diameter, `#24231f`) unspooling from terminal posts and snaking into the distant horizon.
* **3D Camera Coordinates & Travel Path**:
  - Camera Start `[x, y, z]`: `[159.80, 1.46, 5.40]`
  - Camera Midpoint `[x, y, z]`: `[160.00, 1.38, 4.40]`
  - Camera End `[x, y, z]`: `[160.15, 1.28, 3.50]`
  - LookAt Target `[x, y, z]`: `[160.10, 1.05, 0.75]` (framing the wooden plunger box and George's grinning face)
  - Camera Motion Type: Low-profile lateral tracking push-in.
  - Physical Travel Distance: `1.93 meters`  
  - Physical Speed: `0.32 m/s` (~`5.1 pixels/frame` at 720p).
* **3-Tier Depth Staging Breakdown**:
  - **Foreground (`z = +1.6m` to `+2.2m`)**: Asphalt road curb, yellow-striped steel traffic drum grazing the lower frame edge; heavy black detonator cable snaking across foreground asphalt.
  - **Midground (`z = +0.55m` to `+0.80m`)**: Concrete highway barrier (`z = 0.80m`). George (`x = 159.75m, z = 0.55m`) crouching happily behind it, yellow hardhat gleaming, hands firmly grasping the plunger's wooden T-handle.
  - **Background (`z = -1.0m` to `-12.0m`)**: Empty asphalt highway stretching straight away, wooden telephone poles with sagging utility wires, and far in the distance (1/4 mile away, `z = -12.0m`), the tiny silhouette of the beached whale.
* **In-World Physical Signage**:
  - Machine Plaque: Engraved oval brass plate mounted on the oak plunger box:  
    `"DU PONT BLASTING MACHINE NO. 3 — 50 CAPS"`.
  - Roadside Metal Sign: Standard green-and-white reflective highway sign mounted on a post beside the barrier:  
    `"OREGON 101 — BLAST ZONE CLEARANCE: 1/4 MILE"`.
* **Character Framing & Performance**:
  - Framing: Medium close-up (George framed from chest up behind the concrete barrier, occupying 44% screen height).
  - Expression: Gleeful, reckless anticipation (`expression: 'grin' / 'smug'`). Hands grip the T-handle with elbows cocked, ready to slam it downward with comic gusto.

---

### Shot 6: Ground Zero Detonation
* **Shot Number**: 6
* **Timeline**: `26.82s` – `32.28s` (Duration: `5.46s`, `164 frames` @ 30 fps)  
  *(Audio voiceover active from `26.82s` to `32.28s`)*
* **Voiceover Line**:  
  > *"The explosion shakes the ground and launches a massive cloud of sand and blubber into the sky."*
* **3D Environment & World Location**:  
  - Location: Beach Blast Ground Zero & Skyward Volumetric Smoke Plume (World offset `x = 200.00`).
  - Terrain: Cratered beach sand crater blowing apart, water spray from the shoreline.
  - Atmosphere: Violent flash-frame blast, fiery orange and volcanic sand dust blotting out the sky.
* **Key 3D Prop Assets**:
  - Multi-tiered procedural low-poly explosion cloud (Dodecahedron meshes with flat painted toon materials and `#24231f` outlines):
    * Base fireball: 2 interlocking spheres (`radius 1.8m`, fiery crimson-orange `#e5525b`).
    * Column trunk: Dense swirling sand and pulverised blubber (`radius 2.5m`, earthy ochre `#9d8272`).
    * Massive billowing mushroom cap: Gigantic expanding cloud (`radius 2.9m`, warm blubber cream `#f4e2b8`).
    * Crown blast cap: High altitude burst (`radius 1.9m`, fiery orange `#e5525b`, reaching `y = 8.0m`).
  - 8 airborne blubber boulders and sand clumps hurtling outwards on ballistic trajectories.
* **3D Camera Coordinates & Travel Path**:
  - Camera Start `[x, y, z]`: `[200.00, 1.80, 13.50]`
  - Camera Midpoint `[x, y, z]`: `[200.00, 2.40, 11.80]`
  - Camera End `[x, y, z]`: `[200.00, 3.20, 10.00]`
  - LookAt Target `[x, y, z]`: `[200.00, 4.20, -2.00]` (tracking the soaring plume upwards into the sky)
  - Camera Tremor / Screen-Shake: Multi-frequency procedural decay noise applied to camera position and rotation:  
    `shake(t) = exp(-3.2 * (t - 26.82)) * sin(48 * (t - 26.82)) * 0.14m`  
    Active for the first 1.2 seconds of the detonation.
  - Camera Motion Type: High-speed skyward crane ascent with violent initial tremor.
  - Physical Travel Distance: `3.77 meters`  
  - Physical Speed: `0.69 m/s` (~`6.5 pixels/frame` at 720p).
* **3-Tier Depth Staging Breakdown**:
  - **Foreground (`z = +5.0m` to `+7.0m`)**: High-speed shockwave particles, flying sand spray, and splintered timber debris rocketing past the camera lens.
  - **Midground (`z = -1.5m` to `-2.5m`)**: The colossal multi-toned explosion pillar towering from `y = 0.0m` up to `y = 8.5m`, displacing the entire whale carcass.
  - **Background (`z = -10.0m` to `-20.0m`)**: Horizon obscured by shockwave mist, dark overcast clouds, churning white ocean breakers.
* **In-World Physical Signage**:
  - Tumbling Beach Sign: Splintered remnants of the wooden official beach entry sign blasted into the air, tumbling end-over-end in midground right:  
    `"FLORENCE PUBLIC BEACH — ENJOY OREGON'S SHORES"`.
* **Character Framing & Performance**:
  - Framing: Monumental environmental wide shot (the towering smoke column fills 85% of vertical frame height). No human figures present at ground zero, dramatizing the catastrophic physical power of half a ton of dynamite.

---

### Shot 7: The Raining Blubber
* **Shot Number**: 7
* **Timeline**: `32.28s` – `39.34s` (Duration: `7.06s`, `212 frames` @ 30 fps)  
  *(Audio voiceover active from `32.28s` to `39.34s`)*
* **Voiceover Line**:  
  > *"For three seconds, it's completely silent. Then, chunks of rotting blubber start raining from the clouds."*
* **3D Environment & World Location**:  
  - Location: Spectator Viewing Dune Overlook (World offset `x = 240.00`).
  - Terrain: Dune ridge packed with spectators, sand trampled flat, patches of dry dune grass.
  - Atmosphere: Ominous leaden sky, falling shadow silhouettes, surreal silence breaking into wet thuds.
* **Key 3D Prop Assets**:
  - 10 jagged low-poly chunks of rotting blubber falling from sky (`0.35m – 0.50m` irregular slabs, greasy dark liver-charcoal `#2e2527` with painted oily stains and `#24231f` outlines).
  - Wooden coastal directional post with pointing arrows.
  - Coastal fence line with warning flags.
* **3D Camera Coordinates & Travel Path**:
  - Camera Start `[x, y, z]`: `[240.00, 1.30, 6.40]`
  - Camera Midpoint `[x, y, z]`: `[240.00, 1.22, 5.30]`
  - Camera End `[x, y, z]`: `[240.00, 1.15, 4.20]`
  - LookAt Target `[x, y, z]`: `[240.00, 1.75, 0.60]` (tilted upwards toward upturned faces and falling sky debris)
  - Camera Motion Type: Low-angle upward-angled push-in tracking upturned faces.
  - Physical Travel Distance: `2.21 meters`  
  - Physical Speed: `0.31 m/s` (~`4.8 pixels/frame` at 720p).
* **3-Tier Depth Staging Breakdown**:
  - **Foreground (`z = +1.2m` to `+2.2m`)**: Large, wet chunks of blubber tumbling directly past the camera lens with rapid parallax blur; grease droplets splattering on the virtual lens plane.
  - **Midground (`z = +0.80m` to `+1.00m`)**: Three characters frozen side-by-side in absolute petrified horror:
    * Left: George (`x = 239.25m`, hardhat, orange vest).
    * Center: Veteran (`x = 240.00m`, olive field jacket).
    * Right: Town Clerk (`x = 240.75m`, bowler hat).
    All three heads tilted 60° skyward, mouths open in circular O-shapes, hands raising defensively over their heads.
  - **Background (`z = -1.5m` to `-8.0m`)**: Leaden grey clouds raining dozens of dark specks and blubber chunks over distant parked cars and sand dunes.
* **In-World Physical Signage**:
  - Directional Timber Fingerpost: Weathered cedar pole with dual carved wooden arrow signs planted beside the crowd:  
    `"[->] PUBLIC PARKING / [<-] JETTY BEACH OVERLOOK"`.
* **Character Framing & Performance**:
  - Framing: Medium three-shot (trio fills 48% vertical screen height, framed from chest up).
  - Expression & Animation: Frozen deadpan shock snapping into screaming panic (`expression: 'shock'`). Eyes expand into giant cartoon white saucers; trembling stick arms slowly raise to cover their skulls as cast shadows descend across their faces.

---

### Shot 8: The Crushed Sedan
* **Shot Number**: 8
* **Timeline**: `39.34s` – `44.28s` (Duration: `4.94s`, `148 frames` @ 30 fps)  
  *(Audio voiceover active from `39.34s` to `44.28s`)*
* **Voiceover Line**:  
  > *"A slab the size of a coffee table drops straight down and flattens a brand-new car."*
* **3D Environment & World Location**:  
  - Location: Beach Parking Lot — Sedan Site (World offset `x = 280.00`).
  - Terrain: Crushed oyster-shell gravel parking bay (`#c5a378`), timber parking curb bumpers, white painted parking space lines.
  - Atmosphere: Cool, overcast coastal daylight, flying blubber mist and glass glints.
* **Key 3D Prop Assets**:
  - 1970 American Sedan (`1.8m` width, `1.2m` height, `3.6m` length, pristine factory cream body `#eee1d7`, chrome steel bumpers `#cec4b4`, rubber tires `#2d2d23`):
    * Initial state (frames 0–64): Immaculate showroom condition.
    * Post-impact state (frame 65 onward): Crushed roof collapsed flat to door-sill height (`0.78m`), shattered teal windshield glass (`#6f8fa8`), splayed wheels.
  - Massive coffee-table-sized blubber slab (`1.6m × 0.42m × 1.2m`, heavy greasy charcoal `#2e2527` with dark ink outline `#24231f`).
* **3D Camera Coordinates & Travel Path**:
  - Camera Start `[x, y, z]`: `[279.70, 1.65, 6.40]`
  - Camera Midpoint `[x, y, z]`: `[279.95, 1.45, 5.30]`
  - Camera End `[x, y, z]`: `[280.20, 1.25, 4.20]`
  - LookAt Target `[x, y, z]`: `[280.05, 0.85, 0.00]` (targeted on car roof impact point)
  - Camera Motion Type: Descending 3/4 orbital crane drop with violent impact camera slam.
  - Camera Impact Shake: Single sharp vertical shock at `t = 41.50s` (amplitude `0.18m`, decaying over `0.6s`).
  - Physical Travel Distance: `2.25 meters`  
  - Physical Speed: `0.46 m/s` (~`5.5 pixels/frame` at 720p).
* **3-Tier Depth Staging Breakdown**:
  - **Foreground (`z = +1.8m` to `+2.4m`)**: Timber parking space curb log and flying shards of shattered windshield glass and grease droplets spraying forward toward the camera.
  - **Midground (`z = -0.20m` to `+0.30m`)**: The cream sedan parked at a dramatic 3/4 angle (`rotation.y = 0.42 rad`). At `t = 41.50s` (`frame 65`), the coffee-table blubber slab drops out of the sky with catastrophic force, crushing the roof down like an aluminum can.
  - **Background (`z = -2.5m` to `-8.0m`)**: Gravel parking lot, chain-link fence, sandy beach dunes, and rolling coastal sea fog `#baa893`.
* **In-World Physical Signage**:
  - Dealership Rear Window Decal: White-and-red painted decal on the sedan's rear quarter glass:  
    `"WALT PEFFER MOTORS — A WHALE OF A DEAL!"`.
  - Stamped Metal Oregon License Plate: Embossed chrome-and-yellow plate mounted on the front bumper:  
    `"OREGON — 1970 — DEAL"`.
* **Character Framing & Performance**:
  - Framing: High-impact vehicle showcase framing (car fills 55% of horizontal frame width). The comedic focus is entirely on the sudden, crushing physical slapstick of the luxury automobile being demolished.

---

### Shot 9: A Whale of a Deal
* **Shot Number**: 9
* **Timeline**: `44.28s` – `49.10s` (Duration: `4.82s`, `145 frames` @ 30 fps)  
  *(Audio voiceover active from `44.28s` to `49.10s`)*
* **Voiceover Line**:  
  > *"It belonged to the veteran, who'd just bought it on a sale called a whale of a deal."*
* **3D Environment & World Location**:  
  - Location: Crushed Sedan Aftermath & Lot Exit (World offset `x = 320.00`).
  - Terrain: Crushed gravel parking lot with tire skid marks, roadside dune edge.
  - Atmosphere: Soft, quiet coastal fog (`#baa893`), diffused daylight highlighting the ruined roof.
* **Key 3D Prop Assets**:
  - Flattened cream sedan with the coffee-table blubber slab resting on the squashed roof (`x = 320.95m, z = -0.20m`).
  - Single low-poly seagull perched directly on the crumpled car hood (`x = 320.85m, y = 0.95m, z = 0.70m`).
  - Golden brass car key on a key ring dangling from the Veteran's hand (`#d4a037`).
  - Large wooden roadside billboard on the dune ridge behind the car.
* **3D Camera Coordinates & Travel Path**:
  - Camera Start `[x, y, z]`: `[319.90, 1.44, 5.80]`
  - Camera Midpoint `[x, y, z]`: `[320.05, 1.36, 4.90]`
  - Camera End `[x, y, z]`: `[320.20, 1.26, 4.00]`
  - LookAt Target `[x, y, z]`: `[320.00, 1.05, 0.40]` (centered on Veteran's blank face and dangling keys)
  - Camera Motion Type: Low-angle slow comedic ease-in push.
  - Physical Travel Distance: `1.83 meters`  
  - Physical Speed: `0.38 m/s` (~`5.0 pixels/frame` at 720p).
* **3-Tier Depth Staging Breakdown**:
  - **Foreground (`z = +0.88m` to `+1.8m`)**: The shiny golden car key dangling from the Veteran's hand swinging gently like a pendulum (`z = 0.88m`); deep gravel tire tracks in lower frame.
  - **Midground (`z = +0.70m` to `-0.20m`)**:
    * Left Midground (`x = 319.55m, z = 0.85m`): The Military Veteran in his olive jacket, standing motionless, staring blankly straight ahead.
    * Right Midground (`x = 320.95m, z = -0.20m`): The squashed cream sedan with blubber slab.
    * Perched Center (`x = 320.85m, y = 0.95m, z = 0.70m`): A single seagull standing on the hood, tilting its head, blinking once, then flapping wings away toward the horizon at `t = 47.5s`.
  - **Background (`z = -3.5m` to `-10.0m`)**: The large roadside dealership billboard erected on the sandy embankment, telephone poles, gentle coastal fog bank.
* **In-World Physical Signage**:
  - Wooden Dealership Promotional Billboard: Large double-post wooden billboard standing on the dune embankment (`x = 321.8m, y = 2.2m, z = -3.5m`):  
    `"WALT PEFFER BUICK — GET A WHALE OF A DEAL TODAY!"`  
    Complete with a painted cartoon smiling blue whale wearing a sailor cap.
* **Character Framing & Performance**:
  - Character: Military Veteran (Walt Peffer).
  - Framing: Medium-close two-shot (Veteran occupies left 40% of frame, crushed car and seagull occupy right 60%; Veteran head height occupies 45% screen height).
  - Expression: Ultimate deadpan shock (`expression: 'deadpan'`). Blank white circular eyes, hollow unblinking stare, hand limply dangling the brand-new car keys. The single seagull flaps away into the fog, closing the film on poetic, absurd irony.

---

## 4. Technical Implementation & Camera Rig Algorithms

### 4.1 Time Warping & Non-Zero Velocity Spline Sampling
The camera path coordinates for every shot are evaluated via a continuous Catmull-Rom spline controlled by monotonic time warping, guaranteeing non-zero velocity across 100% of frames:

```javascript
// Remotion frame-to-time mapping
const t = frame / fps;

// Continuous Catmull-Rom 3D evaluation
export function cameraAt(shot, t) {
  const u = warpU(shot.beats, t);
  const pos = samplePath(shot.pos, u);
  const look = samplePath(shot.look, u);

  // Apply procedural screen shake on blast/impact beats
  if (shot.shake && t >= shot.shake.start && t <= shot.shake.end) {
    const elapsed = t - shot.shake.start;
    const decay = Math.exp(-shot.shake.damping * elapsed);
    const noiseY = Math.sin(shot.shake.freq * elapsed) * shot.shake.amp * decay;
    const noiseX = Math.cos(shot.shake.freq * 0.8 * elapsed) * (shot.shake.amp * 0.5) * decay;
    pos[0] += noiseX;
    pos[1] += noiseY;
  }

  return { pos, look };
}
```

### 4.2 Depth-of-Field & Atmospheric Fog Calibration
* **Linear Depth Falloff**: Set in Three.js world setup:  
  `scene.fog = new THREE.Fog('#baa893', 8.0, 24.0);`
* **Lens Bokeh Blur Simulation**: Background assets outside the `[-0.5m, +1.5m]` sharp focal zone undergo selective Laplacian softening via low-poly vertex normals and desaturated shadow grading (`#2a3026` to `#351f22`).

### 4.3 Ink Outline Stroke Protocol
* **Core Outline**: Outward-normal extrusion via `CatmullRomCurve3` or inverted backface hull with unlit shader (`MeshBasicMaterial({ color: '#24231f' })`).
* **Thickness**: Calibrated at `0.025 – 0.035` world units for large architectural props (whale, car, barrier) and `0.015 – 0.020` for characters and handheld props, ensuring an exact **4.0px solid core** at 720p resolution.

---

## 5. Verification Checklist & Compliance Summary

- [x] **Strict Script Alignment**: Exact 9-shot sequence from `script/script_final.md` maintained verbatim.
- [x] **Frame-Accurate Audio Timing**: Exact timestamps and durations matching `audio/timing.json` (Total: 49.10s / 1473 frames).
- [x] **100% 3D World Geometry**: Every shot situated in a true Three.js 3D mesh environment; zero flat 2D cardboard backdrops or horizon strips.
- [x] **Continuous 3D Camera Travel**: Every shot features continuous 3D camera travel (push-ins, cranes, orbits) at calibrated velocities between 4.5 and 6.5 px/f (~0.25 – 0.70 m/s); zero static camera holds.
- [x] **3-Tier Depth Staging**: Every shot explicitly defines Foreground (moving parallax props), Midground (character acting zone), and Background (scenery with atmospheric fog falloff).
- [x] **100% In-World Physical Signage**: All labels, titles, and text are physically embedded on 3D props (stenciled crates, carved posts, brass plaques, whiteboards, billboards); zero floating HUD text.
- [x] **Character Scale & Performance**: Characters scaled to chibi 1:3.6 proportions, occupying 38%–46% of vertical screen height for readable comic expressions and physical gestures.
- [x] **Aesthetic Integrity**: Painted low-poly textures with warm dark ink outlines (`#351f22` / `#24231f`) adhering strictly to `analysis/rulebook.md`.
