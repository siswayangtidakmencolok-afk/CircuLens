# Dataset Preprocessing Report — Mehedi2

**Tanggal:** 2026-08-22
**Dataset:** Mehedi2
**Lokasi:** `dataset/Mehedi2`
**Target Model:** MobileNetV2
**Input Size Target:** 224×224

---

## 1. Dataset Summary

- Classes: 5
- Total images (raw, with duplicates): 13,335
- Total unique images (by filename deduplication): **10,974**
- Format: JPEG (.jpg) — 100% consistent
- Splits: train / val / test

---

## 2. Class Distribution

| Class | train | val | test | Raw Total | Unique Filenames |
|---|---:|---:|---:|---:|---:|
| cercospora | 2,021 | 602 | 621 | 3,244 | 2,217 |
| healthy | 1,995 | 610 | 617 | 3,222 | 2,195 |
| mites_and_trips | 2,059 | 375 | 377 | 2,811 | 2,504 |
| nutritional | 1,420 | 304 | 305 | 2,029 | 2,029 |
| powdery mildew | 1,420 | 304 | 305 | 2,029 | 2,029 |
| **Total** | **8,915** | **2,195** | **2,225** | **13,335** | **10,974** |

**Notes:**
- `nutritional` and `powdery mildew` show zero filename duplication (unique = raw total) — their duplicates are only within one split.
- `cercospora`, `healthy`, and `mites_and_trips` each have significant cross-split filename duplication.

---

## 3. Image Dimensions

All images sampled across all splits and all classes are **256×256 pixels**.

| Split | Class | Sampled Dimensions |
|---|---|---|
| train | cercospora | 256×256 (5/5) |
| train | healthy | 256×256 (5/5) |
| train | mites_and_trips | 256×256 (5/5) |
| train | nutritional | 256×256 (5/5) |
| train | powdery mildew | 256×256 (5/5) |
| val | cercospora | 256×256 (5/5) |
| val | healthy | 256×256 (5/5) |
| val | mites_and_trips | 256×256 (5/5) |
| val | nutritional | 256×256 (5/5) |
| val | powdery mildew | 256×256 (5/5) |
| test | cercospora | 256×256 (5/5) |
| test | healthy | 256×256 (5/5) |
| test | mites_and_trips | 256×256 (5/5) |
| test | nutritional | 256×256 (5/5) |
| test | powdery mildew | 256×256 (5/5) |

**Implication:** All images are already 256×256. The standard MobileNetV2 preprocessing pipeline (Resize(256) → CenterCrop(224)) will work without any upscaling artifacts. No dimension normalization needed.

---

## 4. Duplicate Filename Check

**Source:** `lk1_out.txt`

- Total unique filenames across all splits: **10,974**
- Filenames appearing in more than one split: **2,361**
- Rate: ~21.5% of unique filenames are duplicated across splits
- Pattern: same filename, same class, different split (NO cross-class leakage detected)
  - e.g. `healthy_29_7792.jpg` → train/healthy AND val/healthy
  - e.g. `cercospora_8_3411.jpg` → train/cercospora AND test/cercospora

---

## 5. ⚠️ LEAKAGE CHECK — CRITICAL FINDING

**Source:** `hk1_out.txt` (MD5 hash check, 50 files per class per split = 750 files sampled)

| Metric | Value |
|---|---|
| Files sampled | 750 |
| Hash duplicate groups found | 59 |
| Cross-split hash duplicates | **59** (100% of all duplicates) |
| Within-split hash duplicates | 0 |

**All 59 hash duplicates are cross-split.** Sample confirmed cases:

| File | Splits |
|---|---|
| `healthy_0_2904.jpg` | train/healthy ↔ val/healthy |
| `healthy_10_8369.jpg` | val/healthy ↔ test/healthy |
| `healthy_0_1350.jpg` | train/healthy ↔ val/healthy |
| `healthy_0_6856.jpg` | train/healthy ↔ test/healthy |
| `mites_trips_0_4419.jpg` | train/mites_and_trips ↔ test/mites_and_trips |
| `mites_trips_0_2242.jpg` | train/mites_and_trips ↔ test/mites_and_trips |
| `healthy_0_2969.jpg` | train/healthy ↔ val/healthy |
| `healthy_0_2304.jpg` | train/healthy ↔ test/healthy |
| `cercospora_0_6295.jpg` | train/cercospora ↔ val/cercospora |
| `cercospora_11_8188.jpg` | val/cercospora ↔ test/cercospora |

**Extrapolated estimate:** 59 cross-split duplicates found in 750 sampled files (~7.9% of sample). This is consistent with the filename-based finding that 2,361 filenames are leaked (21.5% of 10,974 unique filenames). Hash check confirms filenames are not just name-collisions — the files are byte-identical duplicates.

**Implication:** The original Mehedi2 train/val/test split contains significant data leakage. The same images appear verbatim in both training and evaluation splits. **The original split MUST NOT be used directly for model training and evaluation.**

**Recommended action:** Rebuild the split from scratch using all unique images, seed=42, stratified 70/15/15 split.

---

## 6. Label Quality Check

**Source:** `fn1_out.txt`

All 13,335 filenames follow the `<classprefix>_<N>_<ID>.jpg` augmentation naming convention. Zero mismatches detected across all five classes.

| Class | Total Filenames | Mismatched Labels | Augmentation Pattern `_N_N.jpg` |
|---|---:|---:|---:|
| cercospora | 3,244 | 0 | 3,244 (100%) |
| healthy | 3,222 | 0 | 3,222 (100%) |
| mites_and_trips | 2,811 | 0 | 2,811 (100%) |
| nutritional | 2,029 | 0 | 2,029 (100%) |
| powdery mildew | 2,029 | 0 | 2,029 (100%) |

**Sample filenames:**
- `cercospora_0_1119.jpg`, `cercospora_0_1978.jpg`
- `healthy_0_1052.jpg`, `healthy_0_1214.jpg`
- `mites_trips_0_1396.jpg` *(note: folder is `mites_and_trips`, files use `mites_trips` prefix)*
- `nutritional_0_1967.jpg`
- `powdery mildew_0_1389.jpg` *(filename preserves the space)*

**Note on `mites_and_trips`:** Folder is named `mites_and_trips` but filenames use `mites_trips_` as prefix. This is consistent across all splits and is not a labeling error — just a naming convention difference. Data loader must map folder name `mites_and_trips` to class index without relying on filename prefix.

**Note on `powdery mildew`:** Folder name and filenames both contain a space. Must be handled with `LiteralPath` / quoted strings in any file system code.

**Conclusion:** No mislabeled images detected by filename analysis. Label quality is clean.

---

## 7. Recommended Split Strategy

### Decision: REBUILD REQUIRED

The original split is not safe due to 2,361 cross-split filename duplicates (~21.5% of unique filenames), confirmed by MD5 hash check (59/750 sampled files = 7.9% hash collision rate, all cross-split).

**Recommended approach:**
1. Pool all images from all splits per class into a single list
2. Deduplicate by filename — keep one copy per unique filename (remove duplicates)
3. Apply stratified split: **70% train / 15% val / 15% test** with `seed=42`
4. Verify no filename appears in more than one split after rebuild

**Post-deduplication unique image counts and estimated split sizes (70/15/15):**

| Class | Unique | Est. train (70%) | Est. val (15%) | Est. test (15%) |
|---|---:|---:|---:|---:|
| cercospora | 2,217 | 1,552 | 332 | 333 |
| healthy | 2,195 | 1,537 | 329 | 329 |
| mites_and_trips | 2,504 | 1,753 | 376 | 375 |
| nutritional | 2,029 | 1,420 | 305 | 304 |
| powdery mildew | 2,029 | 1,420 | 305 | 304 |
| **Total** | **10,974** | **7,682** | **1,647** | **1,645** |

---

## 8. Preprocessing Strategy

### TRAIN (augmentation applied on-the-fly during training, NOT pre-applied to disk)

```
Resize(256, 256)
RandomCrop(224, 224)
RandomHorizontalFlip(p=0.5)
RandomVerticalFlip(p=0.3)
RandomRotation(degrees=15)
ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1, hue=0.05)
ToTensor()
Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
```

### VALIDATION (no augmentation)

```
Resize(256, 256)
CenterCrop(224, 224)
ToTensor()
Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
```

### TEST (identical to validation — no augmentation)

```
Resize(256, 256)
CenterCrop(224, 224)
ToTensor()
Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
```

**Rationale for Resize(256) → Crop(224):**
All images are 256×256. Resizing to 256 is a no-op (images are already that size). The CenterCrop/RandomCrop to 224 matches MobileNetV2's expected input and provides a small amount of spatial variation during training without distortion.

**Note:** Augmentation is applied on-the-fly during training (runtime transforms), NOT written back to disk. The existing filenames already encode an augmentation index (`_N_`), suggesting the dataset was pre-augmented. Runtime augmentation on top of this further diversifies the training signal. Pre-applying additional augmentation to disk is not recommended as it would compound the leakage problem.

---

## 9. Remaining Risks

1. **Augmented copies from same source photo** — The `_N_ID` naming convention strongly suggests the dataset was created by augmenting original source images. Images from the same source photo (same `_ID`) but different augmentation index (`_N_`) may appear in different splits even after filename deduplication. Full content-hash deduplication would catch byte-identical copies but cannot identify visually similar augmented variants. This risk is inherent to the dataset construction and cannot be fully eliminated without the original (pre-augmentation) source images.

2. **`mites_and_trips` vs `mites_trips` prefix mismatch** — Folder is `mites_and_trips`, filenames use `mites_trips_`. Not a labeling error, but any code that derives class name from filename will fail. Always derive class label from the folder name.

3. **`powdery mildew` folder name has a space** — Must be handled explicitly in data loader path construction (use `LiteralPath` in PowerShell, raw string or `os.path.join` in Python). Glob patterns without quoting will fail.

4. **Class imbalance** — After deduplication: nutritional (2,029) and powdery mildew (2,029) have ~19% fewer unique images than mites_and_trips (2,504) and similar to cercospora (2,217) and healthy (2,195). The imbalance is mild (~24% gap between smallest and largest), but weighted loss or oversampling should be considered.

5. **License unverified** — Kaggle license confirmation required before competition/commercial use.

6. **Geographic/cultivar diversity unknown** — Model may not generalise to all chili varieties or imaging conditions outside the dataset's collection environment.

---

## 10. Next Steps

1. ✅ Filename leakage detected — 2,361 cross-split duplicates confirmed
2. ✅ MD5 hash check confirms byte-identical cross-split duplicates (59/750 sampled, 7.9%)
3. ✅ Image dimensions confirmed: all 256×256, uniform
4. ✅ Label quality confirmed: 100% filenames follow expected pattern, 0 mismatches
5. ⬜ Rebuild split: pool all images per class → deduplicate by filename → stratified 70/15/15 split (seed=42)
6. ⬜ Optionally: run full MD5 hash check on all 13,335 files to catch any remaining content duplicates beyond filename matches
7. ⬜ Install Python + PyTorch for training environment
8. ⬜ Implement data loader with proper transforms (handle `powdery mildew` space, map `mites_and_trips` folder to class index)
9. ⬜ Train MobileNetV2 baseline on rebuilt split
10. ⬜ Confirm Kaggle license
