# 1-Minute Hinglish Script — AIFlowix Test Render

## Overview & Narrative Structure
- **Title**: AIFlowix Test Render (1-Minute Hinglish)
- **Target Runtime**: 60.0s (1800 frames @ 30 fps)
- **Target Pace**: ~127 words total (~2.1 words/sec, conversational Hinglish delivery)
- **Style Specification**: 3D procedural painted world, 2D flat cutout character, ink stroke `#351f22`, in-world procedural labels, continuous camera travel.

---

## Detailed Shot Breakdown Table

| Shot | Start Time | Duration | Words | Voiceover Line (Hinglish) | Visuals On-Screen & Camera Motion |
| :---: | :---: | :---: | :---: | :--- | :--- |
| **01** | `0:00.0` (f0) | 5.0s (150f) | 10 | *"Zyada tar businesses isliye client nahi khote ki unka kaam kharab hai—"* | Desk office environment. Calm deadpan character seated at wooden desk. Slow camera push-in towards character face. Ink outline `#351f22`. |
| **02** | `0:05.0` (f150) | 5.0s (150f) | 13 | *"balki isliye khote hain kyunki woh 'Hi, kaise madad kar sakte hain?' bolne mein chhah ghante laga dete hain."* | Camera continues tracking in. In-world wall clock spinning wildly, giant retro wall timer ticking past 6 hours. Character glances sideways with deadpan shrug. |
| **03** | `0:10.0` (f300) | 4.5s (135f) | 7 | *"Raat ke baarah baje WhatsApp pe leads aati hain,"* | Dip transition to dark midnight office lighting. Glowing phone / message bubble totem on desk reading "WhatsApp (12:00 AM)". First bead of sweat on character's temple. |
| **04** | `0:14.5` (f435) | 4.5s (135f) | 6 | *"subah tak Excel sheets bhar jaati hain,"* | Morning light snaps on. Endless 3D stacks of paper manifests and Excel grid ledgers piling up beside the desk. Character eyes widen, sweat drops increase (`angerLevel: 0.35`). |
| **05** | `0:19.0` (f570) | 5.0s (150f) | 16 | *"aur team ka aadha hafta copy-paste, follow-up aur aise tools sambhalne mein nikal jaata hai jo aapas mein baat hi nahi karte."* | Camera dollying right. Disconnected broken floating gears and tangled wire props between two isolated booths. Character frantically juggling clipboards (`angerLevel: 0.65`). |
| **06** | `0:24.0` (f720) | 5.0s (150f) | 10 | *"Toote hue workflow pe aur zyada mehnat karke sirf thakaan milti hai."* | Peak frustration: Character tremor shaking, purple face-fill flash, shout mouth snap (`angerLevel: 1.0`). Camera rapid jitter tremor. |
| **07** | `0:29.0` (f870) | 5.0s (150f) | 13 | *"Asli badlav tab aata hai jab aapki website, lead qualification aur daily operations ek connected system ki tarah chalein."* | Instant snap to calm/smug grin. Warm key lighting restores. The chaotic paper piles collapse down as clean geometric platforms ascend into view. |
| **08** | `0:34.0` (f1020) | 6.0s (180f) | 4 | *"Yahi kaam AIFlowix karta hai—"* | Camera sweeps left-to-right around character standing beside a solid carved 3D wooden totem sign with painted letters "AIFlowix". Confident smile. |
| **09** | `0:40.0` (f1200) | 5.0s (150f) | 7 | *"AI-integrated aur clean websites, web apps, custom software,"* | 3D layered glass/wood application portals pop up: sleek modern mockups showing automated dashboards and synced databases. Character points approvingly. |
| **10** | `0:45.0` (f1350) | 5.0s (150f) | 18 | *"WhatsApp automation aur smart lead qualification jo aapke business ke hisaab se chale, chahe aap local ho ya global scale kar rahe ho."* | Glowing synchronized conduits pulse green light connecting the WhatsApp hub to CRM database and global globe prop. Character `speaking: true` gesture. |
| **11** | `0:50.0` (f1500) | 5.0s (150f) | 9 | *"Slow replies aur manual busywork ko apni growth mat rokne do."* | Camera glides into a heroic low-angle tracking shot. Character relaxed, arms crossed, leaning against neat organized desk with streamlined digital pipeline. |
| **12** | `0:55.0` (f1650) | 5.0s (150f) | 14 | *"Routine kaam system ko karne do, aur team ko wahi karne do jisse real business close hota hai."* | Final clean frame: Character confident grin, smooth ease-out dolly. In-world branded wooden plaque / backdrop reading "AIFlowix — Systems that Scale". Fade/dip to cream at 1:00. |

---

## Rulebook & Style Conformance Check
- **Outline Ink Colour**: `#351f22` across all character shapes, architectural contours, and props.
- **Environment**: 100% procedural Three.js geometry (extruded wood, painted walls, bevelled desks, mechanical gears, physical signage). No external bitmap or GLTF assets.
- **Character Specification**: 2D flat stylized cutout inside 3D space (`src/char3.js` base geometry), pear torso, disc hands, expressive mouth/eye states (deadpan, sweat/tremor, shout snap, confident grin).
- **Camera Discipline**: Continuous non-zero velocity (`warpU`), zero stationary holds.
- **Labels**: 100% physically situated in-world (desk nameplates, carved wooden wall signs, physical ledger tabs).

---

## Audio & Voiceover Chapters

### Chapter 1: The Bottleneck Paradox (`0:00 - 0:24`)
> "Zyada tar businesses isliye client nahi khote ki unka kaam kharab hai—balki isliye khote hain kyunki woh 'Hi, kaise madad kar sakte hain?' bolne mein chhah ghante laga dete hain. Raat ke baarah baje WhatsApp pe leads aati hain, subah tak Excel sheets bhar jaati hain, aur team ka aadha hafta copy-paste, follow-up aur aise tools sambhalne mein nikal jaata hai jo aapas mein baat hi nahi karte."

### Chapter 2: The Connected System (`0:24 - 0:50`)
> "Toote hue workflow pe aur zyada mehnat karke sirf thakaan milti hai. Asli badlav tab aata hai jab aapki website, lead qualification aur daily operations ek connected system ki tarah chalein. Yahi kaam AIFlowix karta hai—AI-integrated aur clean websites, web apps, custom software, WhatsApp automation aur smart lead qualification jo aapke business ke hisaab se chale, chahe aap local ho ya global scale kar rahe ho."

### Chapter 3: The Payoff (`0:50 - 1:00`)
> "Slow replies aur manual busywork ko apni growth mat rokne do. Routine kaam system ko karne do, aur team ko wahi karne do jisse real business close hota hai."
