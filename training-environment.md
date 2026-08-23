# Training Environment — CircuLens

**Tanggal:** 2026-08-22
**Target Model:** MobileNetV2
**Dataset:** Mehedi2-clean (10,974 images)

---

## Status: BLOCKED — Python not installed

Python was detected only as a Microsoft Store stub at:

```
C:\Users\User\AppData\Local\Microsoft\WindowsApps\python.exe
```

Running this stub returns:

> *Python was not found; run without arguments to install from the Microsoft Store, or disable this shortcut from Settings > Apps > Advanced app settings > App execution aliases.*

This is **not a real Python installation**. No other Python executable was found on this machine.

---

## Python Environment

| Item | Value |
|---|---|
| Python version | Not installed — see setup instructions below |
| Python path | N/A (MS Store stub only — not usable) |
| Virtual environment | `training/venv/` — not yet created |
| PyTorch version | Not yet installed |
| torchvision version | Not yet installed |
| Device | CPU (Intel local inference) |

---

## Setup Instructions

### Step 1 — Install Python

1. Go to [https://www.python.org/downloads/](https://www.python.org/downloads/)
2. Download **Python 3.11** or **Python 3.12** (recommended: latest 3.11.x for broadest compatibility)
3. Run the installer
4. **Important:** on the first installer screen, check **"Add Python to PATH"** before clicking Install Now
5. Complete the installation
6. Open a new terminal (existing terminals will not pick up the PATH change)
7. Verify: `python --version` should return `Python 3.11.x` or `Python 3.12.x`

### Step 2 — Create virtual environment and install packages

```powershell
powershell -ExecutionPolicy Bypass -NoProfile -File "C:\Users\Public\Documents\Circulens\training\setup_env.ps1"
```

This will:
- Create `training\venv\` virtual environment
- Install torch and torchvision (CPU build, ~1–2 GB download)
- Install Pillow, numpy, scikit-learn, matplotlib
- Write log to `training\setup_out.txt`

### Step 3 — Validate the data loader

```powershell
powershell -ExecutionPolicy Bypass -NoProfile -File "C:\Users\Public\Documents\Circulens\training\run_validate.ps1"
```

This will:
- Load the dataset from `dataset/Mehedi2-clean`
- Check folder structure, image counts, class distribution
- Verify transform pipeline and batch shape
- Write results to `training\validate_out.txt` and `training\loader_result.json`

---

## Directory Structure

```
training/
├── venv/                    ← Python virtual environment (created by setup_env.ps1)
├── setup_env.ps1            ← Environment setup script
├── validate_loader.py       ← Data loader validation script
├── run_validate.ps1         ← Runner script
├── setup_out.txt            ← Setup log (created after setup)
└── validate_out.txt         ← Validation log (created after validation)
```

---

## Dependencies

| Package | Version | Purpose |
|---|---|---|
| torch | latest stable (CPU) | Model training |
| torchvision | latest stable | Image datasets + transforms |
| Pillow | latest | Image loading |
| numpy | latest | Array operations |
| scikit-learn | latest | Metrics |
| matplotlib | latest | Visualization |

Exact versions will be recorded in `training/setup_out.txt` after `setup_env.ps1` runs.

---

## Notes

- All training runs on CPU — compatible with Intel AI PC / OpenVINO pipeline
- No GPU required for prototype training
- Model will be exported to ONNX after training for browser inference
- MS Store app execution aliases can be disabled in: **Settings > Apps > Advanced app settings > App execution aliases** — toggle off `python.exe` and `python3.exe` to prevent the stub from shadowing a real installation
