import os
import sys
import json
import cv2
import numpy as np

# Load known shot counts and cuts from combined_summary and claims_remeasurement
def get_shot_boundaries_for_all_videos():
    with open("analysis/combined_summary.json", "r") as f:
        summary = json.load(f)
    with open("analysis/claims_remeasurement.json", "r") as f:
        claims = json.load(f)
    
    # Check claim 2 cuts overrides
    overrides = {}
    for c in claims.get("claim2_cuts", []):
        vname = c["video"]
        cuts = [item["frame"] for item in c["verified_cuts"]]
        # filter cuts that are clustered within 10 frames (e.g. whip transitions)
        clean_cuts = []
        for cut in sorted(cuts):
            if not clean_cuts or cut - clean_cuts[-1] > 15:
                clean_cuts.append(cut)
        overrides[vname] = clean_cuts
        
    video_shots_map = {}
    for entry in summary:
        vname = entry["filename"]
        tot_frames = entry["total_frames"]
        if vname in overrides and len(overrides[vname]) > 0:
            cuts = overrides[vname]
        else:
            # We detect cuts or estimate uniform shot partitions based on hard_cuts
            cuts = []
            n_cuts = entry["hard_cuts"]
            if n_cuts > 0:
                # Approximate even spacing if exact cut points not specified
                spacing = tot_frames / (n_cuts + 1)
                cuts = [int(spacing * (i + 1)) for i in range(n_cuts)]
        
        # Build shot tuples (start_frame, end_frame)
        boundaries = [0] + cuts + [tot_frames]
        shots = []
        for i in range(len(boundaries) - 1):
            sf = boundaries[i]
            ef = boundaries[i+1]
            if ef - sf > 10:
                shots.append((sf, ef))
        video_shots_map[vname] = {
            "title": entry["title"],
            "total_frames": tot_frames,
            "duration": entry["duration"],
            "shots": shots
        }
    return video_shots_map

print("Shot boundaries loaded successfully.")
