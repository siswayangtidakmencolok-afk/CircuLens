# Data Loader Check — CircuLens

**Tanggal:** 2026-08-22
**Dataset:** `dataset/Mehedi2-clean`
**Script:** `training/validate_loader.py`

---

## Status: BLOCKED — Python not installed

The data loader validation script (`training/validate_loader.py`) could not be executed because no real Python installation was found on this machine.

**Detection result:**

```
FOUND:   C:\Users\User\AppData\Local\Microsoft\WindowsApps\python.exe
VERSION: Python was not found; run without arguments to install from the
         Microsoft Store, or disable this shortcut from Settings > Apps >
         Advanced app settings > App execution aliases.
```

All other candidate paths (Python 3.9–3.12 in standard install locations) were **NOT FOUND**.

To run this check: install Python 3.11+ and follow the setup instructions in `training-environment.md`.

---

## Environment

| Item | Status |
|---|---|
| Python | NOT INSTALLED — MS Store stub only |
| PyTorch | Not yet installed |
| torchvision | Not yet installed |

---

## Folder Structure Check

*Cannot verify — Python not available. Dataset path is:*
`C:\Users\Public\Documents\Circulens\dataset\Mehedi2-clean`

| Check | Result |
|---|---|
| train/ folder | NOT CHECKED |
| validation/ folder | NOT CHECKED |
| test/ folder | NOT CHECKED |
| All class folders present | NOT CHECKED |

---

## Image Count Verification

*Expected counts based on known dataset specification.*

| Split | Expected | Actual | Status |
|---|---:|---:|---|
| train | 7,679 | NOT CHECKED | PENDING |
| validation | 1,644 | NOT CHECKED | PENDING |
| test | 1,651 | NOT CHECKED | PENDING |
| **Total** | **10,974** | NOT CHECKED | PENDING |

---

## Class Distribution

| Class | Expected Total | Actual Total | Status |
|---|---:|---:|---|
| cercospora | 2,217 | NOT CHECKED | PENDING |
| healthy | 2,195 | NOT CHECKED | PENDING |
| mites_and_trips | 2,504 | NOT CHECKED | PENDING |
| nutritional | 2,029 | NOT CHECKED | PENDING |
| powdery mildew | 2,029 | NOT CHECKED | PENDING |

---

## Image Integrity

| Check | Result |
|---|---|
| Sample images opened without error | NOT CHECKED |
| Corrupt images found | NOT CHECKED |

---

## Transform Check

*Transforms are defined in `training/validate_loader.py` and will be verified when Python is available.*

| Transform | Applied |
|---|---|
| Train: RandomCrop(224) | ✅ defined |
| Train: RandomHorizontalFlip | ✅ defined |
| Train: RandomVerticalFlip | ✅ defined |
| Train: RandomRotation(15°) | ✅ defined |
| Train: ColorJitter | ✅ defined |
| Train: ImageNet Normalize | ✅ defined |
| Val/Test: CenterCrop(224) | ✅ defined |
| Val/Test: ImageNet Normalize | ✅ defined |
| Val/Test: NO random augmentation | ✅ defined |

---

## Batch Shape Check

| Check | Expected | Actual | Status |
|---|---|---|---|
| Image tensor shape | [16, 3, 224, 224] | NOT CHECKED | PENDING |
| Label range | 0–4 | NOT CHECKED | PENDING |
| NaN in tensor | 0 | NOT CHECKED | PENDING |
| Image value range | normalized | NOT CHECKED | PENDING |

---

## Overall Result

**BLOCKED — Python not installed**

No checks could be executed. Install Python 3.11+ and run `training/run_validate.ps1` to produce a real PASS/FAIL result.

---

## Class Index Mapping

| Index | Class Name |
|---|---|
| 0 | cercospora |
| 1 | healthy |
| 2 | mites_and_trips |
| 3 | nutritional |
| 4 | powdery mildew |

*(torchvision ImageFolder sorts class folders alphabetically — this order will be confirmed by validation)*

---

## Notes

- Label is derived from folder name (not filename)
- `powdery mildew` folder with a space is handled correctly by ImageFolder
- `mites_and_trips` folder maps to class index 2
- Augmentation applied runtime-only — not written to disk
- Once Python is installed, re-run `training/run_validate.ps1` to populate all PENDING entries above
