import cv2
import numpy as np
import json
import os
import glob

stills_dir = 'c:/Users/dasha/Downloads/ko/stills'
still_files = sorted(glob.glob(os.path.join(stills_dir, 'shot_*.png')))

# Rulebook targets:
# Brightness: 55.0 - 65.0 (median 59.45)
# Saturation: 40.0 - 50.0 (median 45.00)
# Contrast: 18.8 - 25.4 (median 21.60)
# Target Outline: presence ~99%, nadir #24231f

results = []

for f in still_files:
    fname = os.path.basename(f)
    img = cv2.imread(f)
    if img is None:
        continue
    h, w, c = img.shape
    
    # Convert to HSV
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h_chan, s_chan, v_chan = cv2.split(hsv)
    
    mean_v = float(np.mean(v_chan) / 255.0 * 100.0)
    mean_s = float(np.mean(s_chan) / 255.0 * 100.0)
    contrast = float(np.std(v_chan) / 255.0 * 100.0)
    
    # Edges
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 60, 160)
    edge_pct = float(np.count_nonzero(edges) / (h * w) * 100.0)
    
    # Darkest pixels (ink nadir)
    dark_mask = (v_chan < 60)
    if np.any(dark_mask):
        dark_bgr = img[dark_mask]
        median_b = int(np.median(dark_bgr[:, 0]))
        median_g = int(np.median(dark_bgr[:, 1]))
        median_r = int(np.median(dark_bgr[:, 2]))
        ink_hex = f"#{median_r:02x}{median_g:02x}{median_b:02x}"
    else:
        ink_hex = "none"
        
    # Check 10% bounds
    b_ok = (mean_v >= 49.5 and mean_v <= 71.5) # 55-65 +/- 10%
    s_ok = (mean_s >= 36.0 and mean_s <= 55.0) # 40-50 +/- 10%
    c_ok = (contrast >= 17.0 and contrast <= 28.0)
    
    res = {
        "file": fname,
        "brightness": round(mean_v, 2),
        "saturation": round(mean_s, 2),
        "contrast": round(contrast, 2),
        "edge_pct": round(edge_pct, 2),
        "ink_hex": ink_hex,
        "brightness_ok": b_ok,
        "saturation_ok": s_ok,
        "contrast_ok": c_ok
    }
    results.append(res)
    print(f"{fname}: Brightness={mean_v:.1f}% ({b_ok}), Saturation={mean_s:.1f}% ({s_ok}), Contrast={contrast:.1f} ({c_ok}), Edges={edge_pct:.1f}%, Ink={ink_hex}")

with open('c:/Users/dasha/Downloads/ko/stills/initial_metrics.json', 'w') as fp:
    json.dump(results, fp, indent=2)
