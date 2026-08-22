# Dataset Audit Report — CircuLens

**Tanggal Audit:** 2026-08-22
**Auditor:** Kiro AI
**Workspace:** `C:\Users\Public\Documents\Circulens\dataset\`

---

## 1. Dataset Identity

### Dataset A — Chilli Plant Diseases Dataset

| Field | Value |
|---|---|
| Name | Chilli Plant Diseases Dataset |
| Source | Kaggle (`archive.zip`) |
| License | License not verified. Konfirmasi sebelum digunakan untuk kompetisi atau deployment. |
| Task Type | Image Classification |
| Subject | Daun dan bagian tanaman cabai — klasifikasi penyakit / kondisi visual |

### Dataset B — Mehedi2

| Field | Value |
|---|---|
| Name | Mehedi2 |
| Source | Kaggle (`archive.zip`) |
| License | License not verified. Konfirmasi sebelum digunakan untuk kompetisi atau deployment. |
| Task Type | Image Classification |
| Subject | Daun cabai — klasifikasi kondisi/penyakit visual |

---

## 2. Dataset Structure

### Dataset A — Chilli Plant Diseases Dataset

Splits: `train`, `valid`, `test`
Classes: 8
Total images: **6,755**

| Split | Images |
|---|---|
| train | 6,163 |
| valid | 479 |
| test | 113 |
| **Total** | **6,755** |

Class breakdown:

| Class | train | valid | test | Total |
|---|---:|---:|---:|---:|
| Chilli __Whitefly | 500 | 10 | 10 | 520 |
| Chilli __Yellowish | 500 | 10 | 10 | 520 |
| Chilli___healthy | 1,565 | 365 | 10 | 1,940 |
| Chilli__Anthracnos | 430 | 54 | 43 | 527 |
| Chilli__Damping_Off | 168 | 10 | 10 | 188 |
| Chilli__Leaf_Curl_Virus | 500 | 10 | 10 | 520 |
| Chilli__Leaf_Spot | 500 | 10 | 10 | 520 |
| Chilli__Veinal_Mottle_Virus | 2,000 | 10 | 10 | 2,020 |
| **Total** | **6,163** | **479** | **113** | **6,755** |

### Dataset B — Mehedi2

Splits: `train`, `val`, `test`
Classes: 5
Total images: **13,335**

| Split | Images |
|---|---|
| train | 8,915 |
| val | 2,195 |
| test | 2,225 |
| **Total** | **13,335** |

Class breakdown:

| Class | train | val | test | Total |
|---|---:|---:|---:|---:|
| cercospora | 2,021 | 602 | 621 | 3,244 |
| healthy | 1,995 | 610 | 617 | 3,222 |
| mites_and_trips | 2,059 | 375 | 377 | 2,811 |
| nutritional | 1,420 | 304 | 305 | 2,029 |
| powdery mildew | 1,420 | 304 | 305 | 2,029 |
| **Total** | **8,915** | **2,195** | **2,225** | **13,335** |

---

## 3. Class Distribution

### Dataset A — Chilli Plant Diseases Dataset (6,755 images)

| Class | Total | % | Catatan |
|---|---:|---:|---|
| Chilli__Veinal_Mottle_Virus | 2,020 | 29.9% | ⚠️ Over-represented |
| Chilli___healthy | 1,940 | 28.7% | Over-represented |
| Chilli__Anthracnos | 527 | 7.8% | Seimbang |
| Chilli __Whitefly | 520 | 7.7% | Seimbang |
| Chilli __Yellowish | 520 | 7.7% | Seimbang |
| Chilli__Leaf_Curl_Virus | 520 | 7.7% | Seimbang |
| Chilli__Leaf_Spot | 520 | 7.7% | Seimbang |
| Chilli__Damping_Off | 188 | 2.8% | ⚠️ Under-represented |

**Imbalance:** Parah. Veinal_Mottle_Virus (2,020) vs Damping_Off (188) — rasio 10.7:1. Perlu class weighting atau augmentasi.

### Dataset B — Mehedi2 (13,335 images)

| Class | Total | % | Catatan |
|---|---:|---:|---|
| cercospora | 3,244 | 24.3% | Slight majority |
| healthy | 3,222 | 24.2% | Slight majority |
| mites_and_trips | 2,811 | 21.1% | Seimbang |
| nutritional | 2,029 | 15.2% | Sedikit lebih kecil |
| powdery mildew | 2,029 | 15.2% | Sedikit lebih kecil |

**Imbalance:** Ringan. Nutritional dan powdery mildew ~30% lebih kecil dari cercospora/healthy — masih acceptable untuk sebagian besar classifier.

---

## 4. Semantic Audit

### Dataset A — Chilli Plant Diseases Dataset

| Class | Arti | Kategori | Relevan untuk CircuLens |
|---|---|---|---|
| Chilli __Whitefly | Serangan kutu kebul (whitefly) pada daun | Hama | ✅ Plant health monitoring |
| Chilli __Yellowish | Daun menguning — gejala defisiensi nutrisi atau virus | Gejala | ✅ Early warning signal |
| Chilli___healthy | Daun sehat, tidak ada kelainan visual | Baseline | ✅ Kelas negatif yang diperlukan |
| Chilli__Anthracnos | Antraknosa — penyakit jamur (lesi gelap pada buah/daun) | Penyakit | ✅ Disease detection |
| Chilli__Damping_Off | Damping-off — busuk pangkal batang bibit akibat jamur | Penyakit | ⚠️ Terbatas — hanya relevan pada fase persemaian |
| Chilli__Leaf_Curl_Virus | Keriting daun akibat infeksi virus | Penyakit | ✅ Viral disease detection |
| Chilli__Leaf_Spot | Bercak daun jamur atau bakteri | Penyakit | ✅ Disease detection |
| Chilli__Veinal_Mottle_Virus | Virus mottling urat daun — perubahan warna di sepanjang urat | Penyakit | ⚠️ Label noise terdeteksi (lihat bagian Quality) |

### Dataset B — Mehedi2

| Class | Arti | Kategori | Relevan untuk CircuLens |
|---|---|---|---|
| cercospora | Cercospora leaf spot — penyakit jamur, lesi melingkar | Penyakit | ✅ Disease detection |
| healthy | Daun sehat | Baseline | ✅ Kelas negatif yang diperlukan |
| mites_and_trips | Kerusakan akibat tungau dan trips (thrips) | Hama | ✅ Pest detection |
| nutritional | Gejala defisiensi nutrisi pada daun | Defisiensi | ✅ Plant health monitoring |
| powdery mildew | Embun tepung — penyakit jamur, lapisan putih pada daun | Penyakit | ✅ Disease detection |

---

## 5. CircuLens Module Mapping

| Dataset Capability | CircuLens Module | Status | Alasan |
|---|---|---|---|
| Healthy vs abnormal classification (kedua dataset) | Module A — Plant Monitoring | ✅ Supported | Label `healthy` tersedia di kedua dataset sebagai kelas baseline |
| Disease detection — fungal (Anthracnose, Leaf Spot, Cercospora, Powdery Mildew) | Module A — Plant Monitoring | ✅ Supported | Cukup sampel dari kedua dataset |
| Disease detection — viral (Leaf Curl, Veinal Mottle) | Module A — Plant Monitoring | ⚠️ Partial | Dataset A tersedia tapi Veinal Mottle memiliki label noise |
| Pest detection (Whitefly, Mites & Thrips) | Module A — Plant Monitoring | ✅ Supported | Mehedi2 mites_and_trips (2,811 gambar), Dataset A Whitefly (520 gambar) |
| Early symptom — yellowing / nutrient deficiency | Module A — Plant Monitoring | ✅ Supported | Dataset A Yellowish + Mehedi2 nutritional |
| Growth stage / maturity progression | Module B — Growth/Harvest Monitoring | ❌ Not Supported | Tidak ada label ripeness, ukuran buah, atau tahap pertumbuhan |
| Harvest readiness estimation | Module B — Growth/Harvest Monitoring | ❌ Not Supported | Tidak ada data temporal atau label kematangan |
| Post-harvest batch quality grading | Module C — Post-Harvest Assessment | ❌ Not Supported | Tidak ada gambar cabai pasca panen, grading, atau deteriorasi |
| Batch deterioration risk | Module C — Post-Harvest Assessment | ❌ Not Supported | Semua gambar adalah daun tanaman, bukan cabai segar/rusak |

**Kesimpulan:** Kedua dataset hanya mendukung **Module A**. Module B dan C memerlukan dataset terpisah.

---

## 6. Data Quality Findings

### Format File
- Semua gambar di kedua dataset berformat **JPEG (`.jpg`)**.
- Tidak ada format campuran yang terdeteksi pada kelas yang disampling.

### Ukuran File (dari sampling)
- Dataset A sample: 2,914 – 10,884 bytes
- Dataset B sample: 7,149 – 12,853 bytes
- File kecil mengindikasikan gambar sudah di-resize/compress sebelumnya, kemungkinan 224×224 atau lebih kecil. **Rekomendasi: verifikasi dimensi piksel aktual sebelum menentukan input size training.**

### Folder Naming Inconsistency (Dataset A) ⚠️
Dua kelas menggunakan spasi sebelum `__`:
- `Chilli __Whitefly` (ada spasi sebelum `__`)
- `Chilli __Yellowish` (ada spasi sebelum `__`)

Kelas lain menggunakan format tanpa spasi (`Chilli__...`). Ini **harus** dinormalisasi dalam data loading pipeline untuk menghindari error saat training.

### Label Noise (Dataset A) ⚠️ KRITIS
Kelas `Chilli__Veinal_Mottle_Virus` mengandung file dengan nama:
- `Nutrition Deficiency00022_rotated_90.jpg`
- `Nutrition Deficiency00051_flipped_309.jpg`
- `Nutrition Deficiency00001_bright_113.jpg`
- (dan banyak lagi dengan prefix "Nutrition Deficiency")

Ini mengindikasikan gambar defisiensi nutrisi **salah dilabeli** sebagai Veinal Mottle Virus, atau dataset ini di-assemble dengan mencampurkan sumber yang berbeda. **Jangan gunakan kelas ini tanpa verifikasi visual manual terlebih dahulu.**

### Data Leakage (Dataset A, Valid Split) ⚠️
Beberapa nama file di `valid/` identik dengan yang ada di `train/`:
- `Chilli__Damping_Off`: `11831813_147375922263291_...jpeg` ada di kedua split
- `Chilli__Anthracnos`: `1000_F_227403629_...jpeg` ada di kedua split

Ini mengindikasikan **data leakage** — gambar yang sama ada di train dan validation. Perlu deduplikasi sebelum training.

---

## 7. License

> **License not verified** untuk kedua dataset.
>
> Jangan asumsikan dataset bebas digunakan untuk kompetisi atau commercial use. Periksa halaman Kaggle masing-masing dataset untuk lisensi yang berlaku sebelum melakukan deployment atau submission kompetisi.

---

## 8. Recommended MVP Capability

**Klasifikasi kondisi daun cabai (leaf condition classifier)** menggunakan **Dataset B (Mehedi2)** sebagai dataset utama.

Alasan:
1. **Data lebih banyak**: 13,335 vs 6,755 gambar
2. **Label lebih bersih**: tidak ada label noise atau naming inconsistency yang terdeteksi
3. **Distribusi lebih seimbang**: imbalance ringan, tidak memerlukan penanganan khusus
4. **Class coverage relevan**: mencakup healthy, dua jenis penyakit jamur, hama, dan defisiensi nutrisi — semua relevan untuk Module A
5. **Naming konsisten**: semua folder menggunakan konvensi yang konsisten

Dataset A dapat digunakan sebagai **supplementary dataset** setelah normalisasi nama folder dan verifikasi label noise.

---

## 9. Recommended Model Strategy

| Aspek | Rekomendasi |
|---|---|
| Task type | Single-label image classification |
| Primary dataset | Mehedi2 (5 classes) |
| Architecture | MobileNetV2 atau EfficientNet-Lite0 |
| Input size | 224×224 px (konfirmasi dengan cek dimensi aktual) |
| Output | Softmax atas 5 kelas — probabilitas per kelas |
| Training approach | Transfer learning dari ImageNet pretrained weights |
| Export format | ONNX (untuk ONNX Runtime Web di browser) |
| Preprocessing | Resize ke 224×224, normalisasi ke ImageNet mean/std |
| Augmentation | Random flip, rotation, brightness — terutama untuk kelas minoritas |

**Output CircuLens dari model ini:**
- `Healthy` → Visual Health Status: "Healthy", Risk: LOW
- `cercospora` / `powdery mildew` → Visual Health Status: "Disease Detected", Risk: MODERATE–HIGH
- `mites_and_trips` → Visual Health Status: "Pest Detected", Risk: MODERATE
- `nutritional` → Visual Health Status: "Nutritional Stress", Risk: MODERATE

---

## 10. Limitations

1. **Module B dan C tidak dapat dibangun dari dataset ini** — tidak ada label maturity, harvest stage, atau post-harvest quality.
2. **Dimensi piksel belum diverifikasi** — file kecil mengindikasikan pre-resize, tapi harus dikonfirmasi sebelum training.
3. **Label noise kritis di Dataset A** — kelas `Chilli__Veinal_Mottle_Virus` kemungkinan mengandung gambar dari kelas lain.
4. **Data leakage di Dataset A** — beberapa gambar ada di train dan valid sekaligus.
5. **Dataset A naming inconsistency** — dua folder dengan leading space perlu normalisasi.
6. **Diversitas geografis dan varietas tidak diketahui** — model mungkin tidak generalise ke semua varietas cabai atau kondisi lingkungan.
7. **Tidak ada bounding box atau segmentasi** — object detection tidak didukung tanpa re-annotasi.
8. **License belum dikonfirmasi** — risiko penggunaan untuk kompetisi.

---

## 11. Next Steps

1. ✅ **Selesai:** Inspeksi struktur dataset dan audit kelas
2. ⬜ Verifikasi dimensi piksel aktual dengan script Python (setelah Python terinstall)
3. ⬜ Normalisasi nama folder Dataset A (hapus leading space dari `Chilli __Whitefly` dan `Chilli __Yellowish`)
4. ⬜ Spot-check visual 30–50 gambar dari kelas `Chilli__Veinal_Mottle_Virus` untuk konfirmasi label noise
5. ⬜ Deduplikasi gambar antara train dan valid di Dataset A
6. ⬜ Konfirmasi lisensi Kaggle kedua dataset
7. ⬜ Setup training environment (Python + PyTorch + torchvision)
8. ⬜ Training baseline model MobileNetV2 dengan Mehedi2 — target ≥85% validation accuracy
9. ⬜ Evaluasi model di test set Mehedi2
10. ⬜ Export ke ONNX format
11. ⬜ Validasi inference ONNX Runtime Web di browser
12. ⬜ Integrasi ke `InferenceService` CircuLens
