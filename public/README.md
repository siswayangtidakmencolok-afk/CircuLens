# CircuLens — Web UI

Static HTML prototype. No build step required.

## Cara Menjalankan Secara Lokal

### Opsi 1 — Buka langsung di browser (paling mudah)
Double-click `dashboard.html` atau buka via File > Open di browser.

### Opsi 2 — Local server (direkomendasikan, menghindari CORS issues)

**Jika Python tersedia:**
```bash
cd C:\Users\Public\Documents\Circulens\public
py -3.11 -m http.server 8080
```
Buka: http://localhost:8080/dashboard.html

**Jika Node.js tersedia:**
```bash
npx serve C:\Users\Public\Documents\Circulens\public -p 8080
```

**Jika VS Code tersedia:**
Install extension "Live Server" → klik kanan `dashboard.html` → Open with Live Server

## Halaman yang Tersedia

| File | Halaman |
|---|---|
| `dashboard.html` | Dashboard utama, KPI, analisis terbaru |
| `assessment.html` | Upload gambar + AI assessment result |
| `history.html` | Riwayat batch dengan filter |
| `scenario.html` | Perbandingan skenario & jalur sirkular |

## Deploy ke Internet

### Netlify (paling mudah, gratis)
1. Buka https://app.netlify.com
2. Drag-and-drop folder `public/` ke halaman Netlify
3. Dapat URL langsung (misal: `circulens.netlify.app`)

### GitHub Pages
1. Push folder `public/` ke GitHub repository
2. Settings → Pages → Source: Deploy from branch → `/public`
3. Dapat URL: `https://username.github.io/circulens/dashboard.html`

### Vercel
1. Install: `npm i -g vercel`
2. Di folder `public/`: `vercel --prod`
3. Ikuti prompt, dapat URL langsung

## Catatan Penting

- Semua AI inference adalah **Demo Mode** — bukan prediksi model nyata
- Label "⚗️ Prototype AI" muncul di semua halaman AI result
- "CircuLens recommends. You decide." — keputusan final ada di tangan pengguna
- Untuk integrasi model nyata: ganti mock data di `assessment.html` dengan panggilan ke ONNX Runtime Web

## Status

- ✅ Dashboard
- ✅ AI Assessment (upload + mock result)
- ✅ Riwayat Batch
- ✅ Scenario Comparison
- ⏳ Real ONNX inference (pending model training)
- ⏳ Supabase data persistence (pending setup)
