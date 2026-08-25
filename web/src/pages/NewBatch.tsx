import { useState, useRef } from 'react'
import { analyzeImage } from '../services/aiService'
import type { AIResult } from '../services/aiService'

interface NewBatchProps {
  onComplete: (result: AIResult, batchName: string) => void
}

export default function NewBatch({ onComplete }: NewBatchProps) {
  const [step, setStep] = useState<'form' | 'analyzing'>('form')
  const [batchName, setBatchName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [location, setLocation] = useState('')
  const [storage, setStorage] = useState('Standard Ambient (20°C - 25°C)')
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleAnalyze() {
    if (!file) return
    setStep('analyzing')
    const result = await analyzeImage(file)
    onComplete(result, batchName || 'Batch Baru')
  }

  // ── Analyzing state ────────────────────────────────────────────────────────
  if (step === 'analyzing') {
    return (
      <main className="flex-1 p-xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-lg text-center max-w-sm">
          {preview && (
            <img
              src={preview}
              alt="Analyzing"
              className="w-56 h-56 object-cover rounded-DEFAULT shadow-sm opacity-80"
            />
          )}
          <div
            className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin"
            aria-label="Analyzing..."
          />
          <div>
            <h2 className="text-headline-sm font-semibold text-on-surface">
              Menganalisis batch...
            </h2>
            <p className="text-body-sm text-secondary mt-xs">
              ⚗️ Prototype AI sedang memproses kondisi visual
            </p>
          </div>
        </div>
      </main>
    )
  }

  // ── Form state ─────────────────────────────────────────────────────────────
  return (
    <main className="flex-1 p-xl overflow-y-auto">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-xl">

        {/* ── Left: Batch Information form ── */}
        <div className="lg:col-span-7 flex flex-col gap-lg">

          {/* Demo banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-DEFAULT px-lg py-sm flex items-center gap-sm">
            <span className="text-lg">⚗️</span>
            <p className="text-body-sm text-amber-800 font-medium">
              Prototype AI — Demo Mode. Hasil analisis adalah mock data, bukan prediksi model nyata.
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT shadow-sm p-lg">
            <h3 className="text-headline-sm font-semibold text-on-surface mb-lg">
              Batch Information
            </h3>

            <div className="flex flex-col gap-md">

              {/* Batch Name */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-xs transition-all duration-200 focus-within:border-primary-container focus-within:[box-shadow:0_0_0_4px_rgba(74,222,128,0.1)]">
                <label className="block text-label-md text-secondary px-sm pt-xs">
                  Batch Name
                </label>
                <input
                  type="text"
                  value={batchName}
                  onChange={e => setBatchName(e.target.value)}
                  placeholder="e.g. CHL-2026-A1"
                  className="w-full bg-transparent border-none text-on-surface focus:ring-0 outline-none px-sm pb-xs text-body-md"
                />
              </div>

              {/* Quantity + Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-xs transition-all duration-200 focus-within:border-primary-container focus-within:[box-shadow:0_0_0_4px_rgba(74,222,128,0.1)]">
                  <label className="block text-label-md text-secondary px-sm pt-xs">
                    Quantity (kg)
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent border-none text-on-surface focus:ring-0 outline-none px-sm pb-xs text-body-md"
                  />
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-xs transition-all duration-200 focus-within:border-primary-container focus-within:[box-shadow:0_0_0_4px_rgba(74,222,128,0.1)]">
                  <label className="block text-label-md text-secondary px-sm pt-xs">
                    Location
                  </label>
                  <div className="flex items-center px-sm pb-xs">
                    <span className="material-symbols-outlined text-secondary mr-sm" style={{ fontSize: '20px' }}>
                      location_on
                    </span>
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="Warehouse Sector"
                      className="w-full bg-transparent border-none text-on-surface focus:ring-0 outline-none p-0 text-body-md"
                    />
                  </div>
                </div>
              </div>

              {/* Storage Condition */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-xs transition-all duration-200 focus-within:border-primary-container focus-within:[box-shadow:0_0_0_4px_rgba(74,222,128,0.1)]">
                <label className="block text-label-md text-secondary px-sm pt-xs">
                  Storage Condition
                </label>
                <select
                  value={storage}
                  onChange={e => setStorage(e.target.value)}
                  className="w-full bg-transparent border-none text-on-surface focus:ring-0 outline-none px-sm pb-xs text-body-md appearance-none"
                >
                  <option>Standard Ambient (20°C - 25°C)</option>
                  <option>Cold Storage (10°C - 15°C)</option>
                  <option>High Humidity (85%+ RH)</option>
                  <option>Outdoor / Uncontrolled</option>
                </select>
              </div>

              {/* Days since harvest */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-xs transition-all duration-200 focus-within:border-primary-container focus-within:[box-shadow:0_0_0_4px_rgba(74,222,128,0.1)]">
                <label className="block text-label-md text-secondary px-sm pt-xs">
                  Days Since Harvest
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  placeholder="e.g. 3"
                  className="w-full bg-transparent border-none text-on-surface focus:ring-0 outline-none px-sm pb-xs text-body-md"
                />
              </div>

              {/* Notes */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-xs transition-all duration-200 focus-within:border-primary-container focus-within:[box-shadow:0_0_0_4px_rgba(74,222,128,0.1)]">
                <label className="block text-label-md text-secondary px-sm pt-xs">
                  Notes (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Additional observations about this batch..."
                  className="w-full bg-transparent border-none text-on-surface focus:ring-0 outline-none px-sm pb-xs text-body-md resize-none"
                />
              </div>

            </div>
          </div>
        </div>

        {/* ── Right: Image Upload + Analyze ── */}
        <div className="lg:col-span-5 flex flex-col gap-lg">

          <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT shadow-sm p-lg flex flex-col flex-1">
            <h3 className="text-headline-sm font-semibold text-on-surface mb-sm">
              Sample Imagery
            </h3>
            <p className="text-body-sm text-secondary mb-lg">
              Upload high-resolution images of the chili batch for AI ripeness and defect analysis.
            </p>

            {/* Drop zone */}
            <div
              className={`flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-xl text-center cursor-pointer transition-colors relative min-h-[240px] group
                ${dragOver
                  ? 'border-primary bg-surface-container-low'
                  : file
                  ? 'border-primary bg-primary/5'
                  : 'border-outline-variant bg-surface hover:border-primary hover:bg-surface-container-low'
                }`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 max-w-full object-contain rounded-lg mb-md"
                  />
                  <p className="text-body-sm text-primary font-semibold">{file?.name}</p>
                  <p className="text-label-md text-secondary mt-xs">
                    Klik untuk ganti gambar
                  </p>
                </>
              ) : (
                <>
                  <span
                    className="material-symbols-outlined text-secondary group-hover:text-primary mb-md transition-colors"
                    style={{ fontSize: '48px' }}
                  >
                    add_photo_alternate
                  </span>
                  <p className="text-body-md font-semibold text-on-surface">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-body-sm text-secondary mt-xs">
                    SVG, PNG, JPG or GIF (MAX. 800×400px)
                  </p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                onClick={e => e.stopPropagation()}
              />
            </div>

            {/* File info row */}
            {file && (
              <div className="mt-sm flex items-center gap-sm bg-surface-container-low rounded-lg px-md py-sm">
                <span className="material-symbols-outlined text-primary fill" style={{ fontSize: '20px' }}>image</span>
                <span className="text-body-sm text-on-surface font-medium flex-1 truncate">{file.name}</span>
                <button
                  onClick={e => { e.stopPropagation(); setFile(null); setPreview(null) }}
                  className="text-secondary hover:text-error transition-colors text-body-sm"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={!file}
            className="w-full bg-primary-container text-on-primary-container text-headline-sm font-semibold py-md px-xl rounded-full hover:bg-primary hover:text-on-primary transition-colors active:scale-95 flex items-center justify-center gap-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <span className="material-symbols-outlined">troubleshoot</span>
            Analyze Batch
          </button>

          <p className="text-label-md text-secondary text-center">
            ⚗️ Demo AI — bukan prediksi model nyata
          </p>

        </div>
      </div>
    </main>
  )
}
