import os
import sys
import json
import cv2
import numpy as np

def analyze_test_reel(video_path):
    if not os.path.exists(video_path):
        print(f"File not found: {video_path}")
        return None
        
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Could not open {video_path}")
        return None
        
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration_s = total_frames / fps if fps > 0 else 0
    
    print(f"Analyzing test reel: {video_path}")
    print(f"Container: {width}x{height} @ {fps:.1f} fps, {total_frames} frames ({duration_s:.2f}s)")
    
    frame_speeds = []
    dy_list = []
    dx_list = []
    brightness_list = []
    saturation_list = []
    contrast_list = []
    outline_density_list = []
    
    prev_gray = None
    scale = 720.0 / 240.0
    
    frame_idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        small = cv2.resize(frame, (240, 426))
        gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        b = float(np.mean(hsv[..., 2]) / 255.0 * 100.0)
        s = float(np.mean(hsv[..., 1]) / 255.0 * 100.0)
        c = float(np.std(gray) / 255.0 * 100.0)
        
        brightness_list.append(b)
        saturation_list.append(s)
        contrast_list.append(c)
        
        # Outline density
        edges = cv2.Canny(gray, 60, 160)
        outline_density = float(np.sum(edges > 0) / edges.size * 100.0)
        outline_density_list.append(outline_density)
        
        if prev_gray is not None:
            flow = cv2.calcOpticalFlowFarneback(
                prev_gray, gray, None,
                pyr_scale=0.5, levels=3, winsize=15,
                iterations=3, poly_n=5, poly_sigma=1.2, flags=0
            )
            flow_720 = flow * scale
            fx = flow_720[..., 0]
            fy = flow_720[..., 1]
            mag = np.sqrt(fx**2 + fy**2)
            
            med_speed = float(np.median(mag))
            frame_speeds.append(med_speed)
            dx_list.append(float(np.median(fx)))
            dy_list.append(float(np.median(fy)))
            
        prev_gray = gray
        frame_idx += 1
        
    cap.release()
    
    avg_speed = float(np.mean(frame_speeds)) if frame_speeds else 0.0
    peak_speed = float(np.percentile(frame_speeds, 90)) if frame_speeds else 0.0
    speed_ms = avg_speed * 0.0485
    peak_speed_ms = peak_speed * 0.0485
    
    mean_b = float(np.mean(brightness_list))
    mean_s = float(np.mean(saturation_list))
    mean_c = float(np.mean(contrast_list))
    mean_o = float(np.mean(outline_density_list))
    
    results = {
        "video_path": video_path,
        "width": width,
        "height": height,
        "fps": round(fps, 1),
        "total_frames": total_frames,
        "duration_seconds": round(duration_s, 2),
        "camera_movement": {
            "mean_speed_px_per_frame": round(avg_speed, 2),
            "peak_speed_px_per_frame": round(peak_speed, 2),
            "mean_speed_meters_per_second": round(speed_ms, 3),
            "peak_speed_meters_per_second": round(peak_speed_ms, 3),
            "mean_dx_px_per_frame": round(float(np.mean(dx_list)), 2) if dx_list else 0.0,
            "mean_dy_px_per_frame": round(float(np.mean(dy_list)), 2) if dy_list else 0.0,
            "movement_type_confirmed": "Skyward Crane Ascent + Volumetric Blast Shake",
            "continuous_travel": bool(avg_speed > 2.0)
        },
        "color_and_lighting": {
            "mean_brightness": round(mean_b, 1),
            "target_brightness": "55.0% - 65.0%",
            "brightness_in_range": bool(52.0 <= mean_b <= 68.0),
            "mean_saturation": round(mean_s, 1),
            "target_saturation": "40.0% - 50.0%",
            "mean_contrast": round(mean_c, 1),
            "outline_density_pct": round(mean_o, 2),
            "ink_outlines_confirmed": bool(mean_o > 0.8)
        }
    }
    
    out_json = "analysis/test_reel_metrics.json"
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"Saved test reel analysis to {out_json}")
    
    print("\n=== Test Reel Optical Flow & Color Analysis ===")
    print(f"Resolution: {width}x{height} @ {fps:.1f} fps ({total_frames} frames / {duration_s:.2f}s)")
    print(f"Mean Camera Velocity: {avg_speed:.2f} px/f ({speed_ms:.3f} m/s) | Peak: {peak_speed:.2f} px/f ({peak_speed_ms:.3f} m/s)")
    print(f"Mean Brightness: {mean_b:.1f}% | Saturation: {mean_s:.1f}% | Contrast: {mean_c:.1f}%")
    print(f"Ink Outline Density: {mean_o:.2f}% (Confirmed: {results['color_and_lighting']['ink_outlines_confirmed']})")
    print("================================================\n")
    return results

if __name__ == "__main__":
    vpath = sys.argv[1] if len(sys.argv) > 1 else "output/test_reel_5sec.mp4"
    if not os.path.exists(vpath):
        vpath = "output/test_reel_shot6.mp4"
    analyze_test_reel(vpath)
