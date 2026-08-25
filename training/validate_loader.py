"""
CircuLens — Data Loader Validation Script
Validates dataset/Mehedi2-clean for correct structure, image integrity,
class distribution, transforms, and batch shape.
Does NOT train any model.
"""

import os
import sys
import json
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
DATASET_ROOT = Path(r"C:\Users\Public\Documents\Circulens\dataset\Mehedi2-clean")
EXPECTED_CLASSES = ["cercospora", "healthy", "mites_and_trips", "nutritional", "powdery mildew"]
EXPECTED_COUNTS  = {"train": 7679, "validation": 1644, "test": 1651}
EXPECTED_CLASS_TOTALS = {
    "cercospora": 2217, "healthy": 2195, "mites_and_trips": 2504,
    "nutritional": 2029, "powdery mildew": 2029
}
BATCH_SIZE = 16
RESULTS = {"checks": [], "overall": "PASS"}

def fail(msg):
    RESULTS["overall"] = "FAIL"
    RESULTS["checks"].append({"status": "FAIL", "message": msg})
    print(f"  [FAIL] {msg}")

def ok(msg):
    RESULTS["checks"].append({"status": "PASS", "message": msg})
    print(f"  [PASS] {msg}")

def warn(msg):
    RESULTS["checks"].append({"status": "WARN", "message": msg})
    print(f"  [WARN] {msg}")

# ── Check 1: imports ──────────────────────────────────────────────────────────
print("=== CHECK 1: Import dependencies ===")
try:
    import torch
    import torchvision
    from torchvision import datasets, transforms
    from torch.utils.data import DataLoader
    from PIL import Image
    import numpy as np
    ok(f"torch {torch.__version__}")
    ok(f"torchvision {torchvision.__version__}")
    ok(f"PIL (Pillow) available")
    ok(f"numpy {np.__version__}")
except ImportError as e:
    fail(f"Import error: {e}")
    print("\nABORTING — required packages not installed.")
    sys.exit(1)

# ── Check 2: folder structure ─────────────────────────────────────────────────
print("\n=== CHECK 2: Folder structure ===")
for split in ["train", "validation", "test"]:
    split_path = DATASET_ROOT / split
    if not split_path.exists():
        fail(f"Split folder missing: {split_path}")
    else:
        ok(f"Split folder exists: {split}")
        for cls in EXPECTED_CLASSES:
            cls_path = split_path / cls
            if not cls_path.exists():
                fail(f"Class folder missing: {split}/{cls}")
            else:
                ok(f"  {split}/{cls} exists")

# ── Check 3: image count per split ───────────────────────────────────────────
print("\n=== CHECK 3: Image counts ===")
actual_counts = {}
actual_class_totals = {cls: 0 for cls in EXPECTED_CLASSES}
for split in ["train", "validation", "test"]:
    count = 0
    for cls in EXPECTED_CLASSES:
        cls_path = DATASET_ROOT / split / cls
        if cls_path.exists():
            n = len(list(cls_path.glob("*.jpg"))) + len(list(cls_path.glob("*.jpeg")))
            count += n
            actual_class_totals[cls] += n
    actual_counts[split] = count
    expected = EXPECTED_COUNTS[split]
    if count == expected:
        ok(f"{split}: {count} images (expected {expected})")
    else:
        fail(f"{split}: {count} images but expected {expected}")

print("\n  Class totals:")
for cls in EXPECTED_CLASSES:
    actual = actual_class_totals[cls]
    expected = EXPECTED_CLASS_TOTALS[cls]
    if actual == expected:
        ok(f"  {cls}: {actual} (expected {expected})")
    else:
        fail(f"  {cls}: {actual} but expected {expected}")

# ── Check 4: sample image integrity ──────────────────────────────────────────
print("\n=== CHECK 4: Sample image integrity (3 per class per split) ===")
corrupt = 0
checked = 0
for split in ["train", "validation", "test"]:
    for cls in EXPECTED_CLASSES:
        cls_path = DATASET_ROOT / split / cls
        if not cls_path.exists():
            continue
        files = list(cls_path.glob("*.jpg"))[:3]
        for f in files:
            checked += 1
            try:
                img = Image.open(f)
                img.verify()
            except Exception as e:
                corrupt += 1
                fail(f"Corrupt image: {f.name} in {split}/{cls} — {e}")
if corrupt == 0:
    ok(f"All {checked} sampled images opened without error")
else:
    fail(f"{corrupt} corrupt images found in {checked} sampled")

# ── Check 5: transforms ───────────────────────────────────────────────────────
print("\n=== CHECK 5: Transforms ===")
mean = [0.485, 0.456, 0.406]
std  = [0.229, 0.224, 0.225]

train_transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.RandomCrop(224),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomVerticalFlip(p=0.3),
    transforms.RandomRotation(degrees=15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1, hue=0.05),
    transforms.ToTensor(),
    transforms.Normalize(mean=mean, std=std),
])
eval_transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=mean, std=std),
])
ok("Train transforms defined (with augmentation)")
ok("Eval transforms defined (no augmentation)")

# ── Check 6: ImageFolder datasets ────────────────────────────────────────────
print("\n=== CHECK 6: ImageFolder datasets ===")
try:
    train_ds = datasets.ImageFolder(str(DATASET_ROOT / "train"), transform=train_transform)
    val_ds   = datasets.ImageFolder(str(DATASET_ROOT / "validation"), transform=eval_transform)
    test_ds  = datasets.ImageFolder(str(DATASET_ROOT / "test"), transform=eval_transform)
    ok(f"train ImageFolder: {len(train_ds)} samples, classes={train_ds.classes}")
    ok(f"validation ImageFolder: {len(val_ds)} samples")
    ok(f"test ImageFolder: {len(test_ds)} samples")
    # Verify class order
    if train_ds.classes == sorted(EXPECTED_CLASSES):
        ok(f"Class order matches sorted expected: {train_ds.classes}")
    else:
        warn(f"Class order: {train_ds.classes} (expected sorted: {sorted(EXPECTED_CLASSES)})")
except Exception as e:
    fail(f"ImageFolder creation failed: {e}")
    sys.exit(1)

# ── Check 7: DataLoader + batch shape ────────────────────────────────────────
print("\n=== CHECK 7: DataLoader and batch shape ===")
B, C, H, W = None, None, None, None
try:
    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    images, labels = next(iter(train_loader))
    B, C, H, W = images.shape
    ok(f"Batch shape: [{B}, {C}, {H}, {W}] (expected [16, 3, 224, 224])")
    if C == 3 and H == 224 and W == 224:
        ok("Image tensor shape is correct: [B, 3, 224, 224]")
    else:
        fail(f"Unexpected shape: [{B}, {C}, {H}, {W}]")
    if labels.min().item() >= 0 and labels.max().item() <= 4:
        ok(f"Label range: [{labels.min().item()}, {labels.max().item()}] (expected 0–4)")
    else:
        fail(f"Label out of range: min={labels.min().item()} max={labels.max().item()}")
    nan_count = torch.isnan(images).sum().item()
    if nan_count == 0:
        ok("No NaN values in image tensor")
    else:
        fail(f"NaN values found: {nan_count}")
    ok(f"Image min={images.min():.4f} max={images.max():.4f} mean={images.mean():.4f}")
except Exception as e:
    fail(f"DataLoader batch check failed: {e}")

# ── Summary ───────────────────────────────────────────────────────────────────
print(f"\n=== RESULT: {RESULTS['overall']} ===")
passed = sum(1 for c in RESULTS["checks"] if c["status"] == "PASS")
failed = sum(1 for c in RESULTS["checks"] if c["status"] == "FAIL")
warned = sum(1 for c in RESULTS["checks"] if c["status"] == "WARN")
print(f"  PASS: {passed}  FAIL: {failed}  WARN: {warned}")

# Write JSON result
result_path = Path(r"C:\Users\Public\Documents\Circulens\training\loader_result.json")
result_path.parent.mkdir(parents=True, exist_ok=True)
with open(result_path, "w") as f:
    json.dump({
        "overall": RESULTS["overall"],
        "passed": passed, "failed": failed, "warned": warned,
        "actualCounts": actual_counts,
        "actualClassTotals": actual_class_totals,
        "batchShape": [B, C, H, W] if B is not None else None,
        "checks": RESULTS["checks"]
    }, f, indent=2)
print(f"\nResult written to: {result_path}")
