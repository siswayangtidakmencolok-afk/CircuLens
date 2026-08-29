import { useState, useRef, useCallback } from 'react'
import { analyzeImage } from '../services/aiService'
import type { AIResult } from '../services/aiService'

interface NewBatchProps {
  onComplete: (result: AIResult, batchName: string, quantity: string) => void
}

type ImageSource = 'upload' | 'camera'

export default function NewBatch({ onComplete }: NewBatchProps) {
  const [step, setStep]         = useState<'form' | 'analyzing'>('form')
  const [batchName, setBatchName] = useState('')
  const [quantity, setQuantity]   = useState('')
  const [location, setLocation]   = useState('')
  const [daysSince, setDaysSince] = useState('')
  const [storage, setStorage]     = useState('Standard Ambient (20°C - 25°C)')
  const [notes, setNotes]         = useState('')
  const [preview, setPreview]     = useState<string | null>(null)
  const [file, setFile]           = useState<File | null>(null)
  const [dragOver, setDragOver]   = useState(false)
  const [imageSource, setImageSource] = useState<ImageSource>('upload')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)

  const fileRef   = useRef<HTMLInputElement>(null)
  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  /* ── file helpers ──────────────────────────────────────────────────────── */
  function applyFile(f: File) {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setCameraActive(false)
    stopCamera()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) applyFile(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) applyFile(f)
  }

  /* ── camera helpers ────────────────────────────────────────────────────── */
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  async function startCamera() {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCameraActive(true)
      setImageSource('camera')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setCameraError(`Kamera tidak dapat diakses: ${msg}`)
    }
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return
    const v = videoRef.current
    const c = canvasRef.current
    c.width  = v.videoWidth
    c.height = v.videoHeight
    c.getContext('2d')?.drawImage(v, 0, 0)
    c.toBlob(blob => {
      if (!blob) return
      const f = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
      applyFile(f)
    }, 'image/jpeg', 0.92)
  }

  /* ── analyze ───────────────────────────────────────────────────────────── */
  async function handleAnalyze() {
    if (!file) return
    setStep('analyzing')
    stopCamera()
    const result = await analyzeImage(file)
    onComplete(result, batchName || 'Batch Baru', quantity)
  }

  /* ── analyzing screen ──────────────────────────────────────────────────── */
  if (step === 'analyzing') {
    return (
      <main className="flex-1 flex items-center justify-center p-xl">
        <div className="flex flex-col items-center gap-lg text-center max-w-sm">
          {preview && (
            <img src={preview} alt="Analyzing" className="w-56 h-56 object-cover rounded-2xl shadow-md opacity-80" />
          )}
          <div className="relative w-16 h-16">
            <div className="w-16 h-16 border-4 border-surface-container-high rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <p className="cl-headline text-on-surface">Menganalisis batch...</p>
            <p className="text-body-sm text-secondary mt-xs">⚗️ Prototype AI sedang memproses kondisi visual</p>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '70%' }} />
          </div>
        </div>
      </main>
    )
  }

  /* ── main form ─────────────────────────────────────────────────────────── */
  return (
    <main className="flex-1 p-md md:p-xl overflow-y-auto">

      {/* Page title */}
      <div className="mb-xl">
        <p className="cl-label text-secondary mb-xs">Analisis Baru</p>
        <h1 className="cl-display text-on-surface">Batch Assessment</h1>
        <p className="text-body-md text-secondary mt-xs">Upload atau ambil foto batch cabai untuk analisis kondisi AI.</p>
      </div>

      {/* Demo banner */}
      <div className="flex items-center gap-sm bg-amber-50 border border-amber-200 rounded-2xl px-lg py-sm mb-lg">
        <span className="text-lg shrink-0">⚗️</span>
        <p className="text-body-sm text-amber-800 font-semibold">
          Prototype AI — Demo Mode.{' '}
          <span className="font-normal">Hasil analisis adalah mock data, bukan prediksi model nyata.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">

        {/* ── LEFT: form ── */}
        <div className="lg:col-span-7 flex flex-col gap-lg">
          <div className="cl-card">
            <p className="cl-label text-secondary mb-md">Informasi Batch</p>
            <h2 className="cl-title text-on-surface mb-lg">Batch Information</h2>

            <div className="flex flex-col gap-md">
              {/* Batch name */}
              <InputField label="Batch Name" value={batchName} onChange={setBatchName} placeholder="e.g. CHL-2026-A1" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <InputField label="Quantity (kg)" value={quantity} onChange={setQuantity} placeholder="e.g. 45.0" type="number" />
                <InputFieldIcon
                  label="Location"
                  value={location}
                  onChange={setLocation}
                  placeholder="Warehouse Sector"
                  icon="location_on"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <InputField label="Hari Sejak Panen" value={daysSince} onChange={setDaysSince} placeholder="e.g. 3" type="number" />
                <SelectField
                  label="Storage Condition"
                  value={storage}
                  onChange={setStorage}
                  options={[
                    'Standard Ambient (20°C - 25°C)',
                    'Cold Storage (10°C - 15°C)',
                    'High Humidity (85%+ RH)',
                    'Outdoor / Uncontrolled',
                  ]}
                />
              </div>

              {/* Notes */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <label className="block cl-label text-secondary px-sm pt-xs">Notes (opsional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Observasi tambahan tentang batch ini..."
                  className="w-full bg-transparent border-none text-on-surface focus:ring-0 outline-none px-sm pb-xs text-body-md resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: image + analyze ── */}
        <div className="lg:col-span-5 flex flex-col gap-lg">
          <div className="cl-card flex flex-col flex-1 !hover:transform-none">

            <p className="cl-label text-secondary mb-xs">Sample Imagery</p>
            <h2 className="cl-title text-on-surface mb-xs">Upload / Kamera</h2>
            <p className="text-body-sm text-secondary mb-lg">
              Upload gambar atau gunakan kamera untuk analisis kondisi visual batch.
            </p>

            {/* Source toggle */}
            <div className="flex gap-sm mb-md">
              <button
                onClick={() => { setImageSource('upload'); setCameraActive(false); stopCamera() }}
                className={`flex-1 flex items-center justify-center gap-xs py-sm rounded-xl text-body-sm font-semibold transition-colors border ${
                  imageSource === 'upload'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'border-outline-variant text-secondary hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-base">upload_file</span>
                Upload File
              </button>
              <button
                onClick={() => { setImageSource('camera'); if (!cameraActive) startCamera() }}
                className={`flex-1 flex items-center justify-center gap-xs py-sm rounded-xl text-body-sm font-semibold transition-colors border ${
                  imageSource === 'camera'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'border-outline-variant text-secondary hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-base">photo_camera</span>
                Ambil Foto
              </button>
            </div>

            {/* Camera error */}
            {cameraError && (
              <div className="mb-md bg-error-container text-on-error-container text-body-sm px-md py-sm rounded-xl">
                {cameraError}
              </div>
            )}

            {/* Camera viewfinder */}
            {imageSource === 'camera' && cameraActive && !preview && (
              <div className="flex-1 flex flex-col gap-sm min-h-[280px]">
                <div className="flex-1 relative bg-black rounded-2xl overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  {/* Corner guides */}
                  <div className="absolute inset-4 pointer-events-none">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary-container rounded-tl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary-container rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary-container rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary-container rounded-br" />
                  </div>
                </div>
                <button
                  onClick={capturePhoto}
                  className="w-full bg-primary text-on-primary py-sm rounded-full text-body-md font-bold flex items-center justify-center gap-sm hover:bg-primary/90 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined">photo_camera</span>
                  Ambil Foto Sekarang
                </button>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            {/* Upload drop zone (shown when upload mode OR after capture) */}
            {(imageSource === 'upload' || (imageSource === 'camera' && (!cameraActive || preview))) && (
              <div
                className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-xl text-center cursor-pointer transition-all relative min-h-[240px] group
                  ${dragOver ? 'border-primary bg-surface-container-low scale-[1.01]'
                    : file ? 'border-primary bg-primary/5'
                    : 'border-outline-variant bg-surface hover:border-primary hover:bg-surface-container-low'}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {preview ? (
                  <div className="flex flex-col items-center gap-sm w-full">
                    <img src={preview} alt="Preview" className="max-h-52 max-w-full object-contain rounded-xl shadow-sm" />
                    <p className="text-body-sm text-primary font-semibold truncate max-w-full px-sm">
                      {file?.name}
                    </p>
                    <p className="cl-label text-secondary">Klik untuk ganti gambar</p>
                  </div>
                ) : (
                  <>
                    <span
                      className="material-symbols-outlined text-outline group-hover:text-primary mb-md transition-colors"
                      style={{ fontSize: '52px' }}
                    >
                      add_photo_alternate
                    </span>
                    <p className="text-body-md font-bold text-on-surface">Drag & drop atau klik upload</p>
                    <p className="text-body-sm text-secondary mt-xs">JPG, PNG, WEBP (maks. 10MB)</p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  onClick={e => e.stopPropagation()}
                />
              </div>
            )}

            {/* File chip */}
            {file && (
              <div className="mt-sm flex items-center gap-sm bg-surface-container-low rounded-xl px-md py-sm">
                <span className="material-symbols-outlined text-primary fill" style={{ fontSize: '18px' }}>image</span>
                <span className="text-body-sm text-on-surface font-medium flex-1 truncate">{file.name}</span>
                <button
                  onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); setCameraActive(false); stopCamera() }}
                  className="text-secondary hover:text-error transition-colors text-sm font-bold"
                  aria-label="Hapus gambar"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Analyze CTA */}
          <button
            onClick={handleAnalyze}
            disabled={!file}
            className="w-full bg-primary text-on-primary py-md px-xl rounded-full text-body-lg font-bold hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-sm shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <span className="material-symbols-outlined">troubleshoot</span>
            Analyze Batch
          </button>
          <p className="cl-label text-secondary text-center">⚗️ Demo AI — bukan prediksi model nyata</p>
        </div>
      </div>
    </main>
  )
}

/* ── Reusable field components ──────────────────────────────────────────── */
function InputField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
      <label className="block cl-label text-secondary px-sm pt-xs">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-none text-on-surface focus:ring-0 outline-none px-sm pb-xs text-body-md"
      />
    </div>
  )
}

function InputFieldIcon({ label, value, onChange, placeholder, icon }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; icon: string
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
      <label className="block cl-label text-secondary px-sm pt-xs">{label}</label>
      <div className="flex items-center px-sm pb-xs gap-xs">
        <span className="material-symbols-outlined text-secondary" style={{ fontSize: '18px' }}>{icon}</span>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none text-on-surface focus:ring-0 outline-none p-0 text-body-md"
        />
      </div>
    </div>
  )
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
      <label className="block cl-label text-secondary px-sm pt-xs">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-transparent border-none text-on-surface focus:ring-0 outline-none px-sm pb-xs text-body-md appearance-none"
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}
