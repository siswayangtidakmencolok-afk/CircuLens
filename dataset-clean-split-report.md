# Dataset Clean Split Report — Mehedi2

**Tanggal Rebuild:** 2026-08-22
**Source Dataset:** `dataset/Mehedi2`
**Output Dataset:** `dataset/Mehedi2-clean`
**Script:** `rebuild.ps1`
**Seed:** 42 | **Split:** 70 / 15 / 15

---

## Original Dataset

| Metric | Value |
|---|---|
| Total images (original, with duplicates) | 13,335 |
| Classes | 5 |
| Original splits | train / val / test |

---

## Exact Duplicate Groups (SHA-256)

| Metric | Value |
|---|---|
| Duplicate groups found | 3 |
| Files removed (keeping one per group) | 2,361 |
| Final unique image count | 10,974 |

---

## Class Distribution

| Class | Train | Validation | Test | Total |
|---|---:|---:|---:|---:|
| cercospora | 1,551 | 332 | 334 | 2,217 |
| healthy | 1,536 | 329 | 330 | 2,195 |
| mites_and_trips | 1,752 | 375 | 377 | 2,504 |
| nutritional | 1,420 | 304 | 305 | 2,029 |
| powdery mildew | 1,420 | 304 | 305 | 2,029 |
| **Total** | **7,679** | **1,644** | **1,651** | **10,974** |

---

## Leakage Check (SHA-256 Full Scan)

| Comparison | Overlap Count |
|---|---|
| Train ↔ Validation | 0 |
| Train ↔ Test | 0 |
| Validation ↔ Test | 0 |

## Result

**PASS — no exact hash overlap**

---

## Notes

- Deduplication used SHA-256 hash — not filename comparison
- One representative file kept per duplicate group (first encountered during pool traversal)
- Split is reproducible with seed=42 using Fisher-Yates shuffle
- Original `dataset/Mehedi2/` is untouched
- `powdery mildew` folder name contains a space — handled with LiteralPath throughout
- `mites_and_trips` folder uses `mites_trips_` filename prefix — class label derived from folder name, not filename

---

## Output Structure

```
dataset/Mehedi2-clean/
├── train/
│   ├── cercospora/       (1,551 files)
│   ├── healthy/          (1,536 files)
│   ├── mites_and_trips/  (1,752 files)
│   ├── nutritional/      (1,420 files)
│   └── powdery mildew/   (1,420 files)
├── validation/
│   ├── cercospora/       (332 files)
│   ├── healthy/          (329 files)
│   ├── mites_and_trips/  (375 files)
│   ├── nutritional/      (304 files)
│   └── powdery mildew/   (304 files)
└── test/
    ├── cercospora/       (334 files)
    ├── healthy/          (330 files)
    ├── mites_and_trips/  (377 files)
    ├── nutritional/      (305 files)
    └── powdery mildew/   (305 files)
```
