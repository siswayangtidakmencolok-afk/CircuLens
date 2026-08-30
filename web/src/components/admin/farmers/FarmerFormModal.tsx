import { useEffect, useState } from 'react'
import type { FarmerProfile } from '../../../hooks/useFarmers'

export interface FarmerFormData {
  full_name: string
  farmer_code: string
  dusun: string
  rt_rw: string
  total_land_hectare: number
  total_batches: number
  main_land_status: FarmerProfile['main_land_status']
}

interface Props {
  open: boolean
  initial?: FarmerProfile | null
  onClose: () => void
  onSave: (data: FarmerFormData) => Promise<void> | void
}

const STATUS_OPTIONS: { value: FarmerProfile['main_land_status']; label: string }[] = [
  { value: 'siap_panen', label: 'Siap Panen' },
  { value: 'fase_vegetatif', label: 'Fase Vegetatif' },
  { value: 'perlu_irigasi', label: 'Perlu Irigasi' },
  { value: 'pasca_panen', label: 'Pasca Panen' },
]

const DUSUN_PRESETS = ['Dusun Krajan', 'Dusun Sukamaju', 'Dusun Mekar', 'Dusun Selatan']

const EMPTY: FarmerFormData = {
  full_name: '',
  farmer_code: '',
  dusun: '',
  rt_rw: '',
  total_land_hectare: 0,
  total_batches: 0,
  main_land_status: 'fase_vegetatif',
}

export function FarmerFormModal({ open, initial, onClose, onSave }: Props) {
  const [form, setForm] = useState<FarmerFormData>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              full_name: initial.full_name,
              farmer_code: initial.farmer_code,
              dusun: initial.dusun,
              rt_rw: initial.rt_rw,
              total_land_hectare: initial.total_land_hectare,
              total_batches: initial.total_batches,
              main_land_status: initial.main_land_status,
            }
          : EMPTY
      )
      setError(null)
    }
  }, [open, initial])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [open])

  if (!open) return null

  function update<K extends keyof FarmerFormData>(
    key: K,
    value: FarmerFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.full_name.trim()) {
      setError('Nama lengkap wajib diisi.')
      return
    }
    if (!form.farmer_code.trim()) {
      setError('Kode petani (contoh: FRM-2024-001) wajib diisi.')
      return
    }
    if (!form.dusun.trim()) {
      setError('Dusun wajib diisi.')
      return
    }
    if (form.total_land_hectare < 0) {
      setError('Total lahan tidak boleh negatif.')
      return
    }
    if (form.total_batches < 0) {
      setError('Jumlah batch tidak boleh negatif.')
      return
    }

    try {
      setSaving(true)
      await onSave(form)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan data.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-md"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-background/40 backdrop-blur-sm"
        onClick={saving ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-2xl bg-surface-container-lowest rounded-lg border border-outline shadow-xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-md py-sm border-b border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-primary font-semibold">
            {initial?.id ? 'Edit Data Petani' : 'Daftarkan Petani Baru'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container-low active:scale-95 disabled:opacity-50"
            aria-label="Tutup modal"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              close
            </span>
          </button>
        </div>

        {/* Body */}
        <div className="p-md flex flex-col gap-sm overflow-y-auto">
          {/* Nama & Kode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block mb-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
                Nama Lengkap
              </label>
              <input
                type="text"
                className="w-full rounded-full border border-outline-variant bg-surface-container-low px-sm py-[10px] font-body-md text-body-md text-on-surface focus:border-2 focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all"
                placeholder="cth. Suparman M."
                value={form.full_name}
                onChange={(e) => update('full_name', e.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block mb-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
                Kode Petani
              </label>
              <input
                type="text"
                className="w-full rounded-full border border-outline-variant bg-surface-container-low px-sm py-[10px] font-body-md text-body-md text-on-surface focus:border-2 focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all"
                placeholder="cth. FRM-2024-001"
                value={form.farmer_code}
                onChange={(e) => update('farmer_code', e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {/* Dusun & RT/RW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block mb-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
                Dusun
              </label>
              <input
                type="text"
                list="dusun-presets"
                className="w-full rounded-full border border-outline-variant bg-surface-container-low px-sm py-[10px] font-body-md text-body-md text-on-surface focus:border-2 focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all"
                placeholder="cth. Dusun Krajan"
                value={form.dusun}
                onChange={(e) => update('dusun', e.target.value)}
                disabled={saving}
              />
              <datalist id="dusun-presets">
                {DUSUN_PRESETS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block mb-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
                RT / RW
              </label>
              <input
                type="text"
                className="w-full rounded-full border border-outline-variant bg-surface-container-low px-sm py-[10px] font-body-md text-body-md text-on-surface focus:border-2 focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all"
                placeholder="cth. RT 02/01"
                value={form.rt_rw}
                onChange={(e) => update('rt_rw', e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {/* Lahan & Batch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block mb-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
                Total Lahan (Hektar)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  className="w-full rounded-full border border-outline-variant bg-surface-container-low pl-sm pr-12 py-[10px] font-body-md text-body-md text-on-surface focus:border-2 focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all"
                  placeholder="0"
                  value={form.total_land_hectare || ''}
                  onChange={(e) =>
                    update('total_land_hectare', Number(e.target.value) || 0)
                  }
                  disabled={saving}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-body-md text-body-md text-on-surface-variant pointer-events-none">
                  ha
                </span>
              </div>
            </div>
            <div>
              <label className="block mb-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
                Jumlah Batch
              </label>
              <input
                type="number"
                min={0}
                step={1}
                className="w-full rounded-full border border-outline-variant bg-surface-container-low px-sm py-[10px] font-body-md text-body-md text-on-surface focus:border-2 focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all"
                placeholder="0"
                value={form.total_batches || ''}
                onChange={(e) =>
                  update('total_batches', Number(e.target.value) || 0)
                }
                disabled={saving}
              />
            </div>
          </div>

          {/* Status Lahan */}
          <div>
            <label className="block mb-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
              Status Lahan Utama
            </label>
            <select
              className="w-full rounded-full border border-outline-variant bg-surface-container-low px-sm py-[10px] font-body-md text-body-md text-on-surface focus:border-2 focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all appearance-none bg-no-repeat pr-10"
              value={form.main_land_status}
              onChange={(e) =>
                update(
                  'main_land_status',
                  e.target.value as FarmerProfile['main_land_status']
                )
              }
              disabled={saving}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23707a6f' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.5em 1.5em',
              }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Preview Avatar */}
          <div className="bg-surface-container-low rounded-lg p-md flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">
              {form.full_name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase() ?? '')
                .join('') || '??'}
            </div>
            <div>
              <p className="font-label-md text-label-md text-primary">
                {form.full_name || 'Nama Petani'}
              </p>
              <p className="text-sm text-on-surface-variant">
                {form.farmer_code || 'Belum ada kode'} ·{' '}
                {form.total_land_hectare.toLocaleString('id-ID', {
                  maximumFractionDigits: 1,
                })}{' '}
                ha
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container rounded-lg px-md py-sm font-label-md text-label-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-sm px-md py-sm border-t border-outline-variant bg-surface-bright rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="font-label-md text-label-md px-lg py-xs rounded-full bg-[#4ADE80]/10 text-primary-container hover:bg-[#4ADE80]/20 transition-colors active:scale-95 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="font-label-md text-label-md px-lg py-xs rounded-full bg-primary-container text-on-primary hover:bg-primary transition-colors active:scale-95 shadow-sm disabled:opacity-60 inline-flex items-center gap-2"
          >
            {saving && (
              <span className="material-symbols-outlined text-base animate-spin">
                progress_activity
              </span>
            )}
            {initial?.id ? 'Perbarui' : 'Daftarkan'}
          </button>
        </div>
      </form>
    </div>
  )
}