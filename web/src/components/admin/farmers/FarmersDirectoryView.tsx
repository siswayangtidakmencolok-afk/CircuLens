import { useState } from 'react'
import { useFarmers, type FarmerProfile } from '../../../hooks/useFarmers'
import { FarmerKPICards } from './FarmerKPICards'
import { FarmerTable } from './FarmerTable'
import { FarmerFormModal, type FarmerFormData } from './FarmerFormModal'

interface Props {
  onNavigate?: (id: string) => void
}

export function FarmersDirectoryView({ onNavigate: _onNavigate }: Props) {
  const { farmers, loading, error, addFarmer, updateFarmer, deleteFarmer } =
    useFarmers()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FarmerProfile | null>(null)

  function handleAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function handleEdit(farmer: FarmerProfile) {
    setEditing(farmer)
    setModalOpen(true)
  }

  async function handleSave(data: FarmerFormData) {
    if (editing) {
      await updateFarmer(editing.id, data)
    } else {
      await addFarmer(data)
    }
  }

  async function handleDelete(f: FarmerProfile) {
    if (confirm(`Hapus data petani ${f.full_name}?`)) {
      try {
        await deleteFarmer(f.id)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Gagal menghapus data')
      }
    }
  }

  // ── Empty State ─────────────────────────────────────────────
  if (!loading && farmers.length === 0) {
    return (
      <div className="flex flex-col gap-md">
        {/* Page Header */}
        <div className="mb-md flex justify-between items-end gap-md flex-wrap">
          <div>
            <h2 className="font-display-lg text-display-lg text-primary mb-xs">
              Direktori Petani
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Kelola dan pantau aktivitas petani cabai yang terdaftar di wilayah
              desa Anda.
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="bg-primary-container text-on-primary px-sm py-2 rounded-full font-label-md text-label-md flex items-center gap-2 hover:bg-primary transition-colors shadow-sm hover:shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Tambah Petani Baru
          </button>
        </div>

        <FarmerKPICards farmers={farmers} />

        {/* Empty State Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-xl flex flex-col items-center justify-center text-center min-h-[420px]">
          <div className="w-24 h-24 rounded-full bg-secondary-container/30 flex items-center justify-center mb-md">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: '48px', fontVariationSettings: "'FILL' 1" }}
            >
              groups
            </span>
          </div>
          <h3 className="font-headline-md text-headline-md text-primary mb-xs">
            Belum Ada Petani Terdaftar
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-lg">
            Daftarkan petani cabai pertama Anda untuk mulai memantau aktivitas
            lahan, hasil panen, dan distribusi di desa.
          </p>
          <button
            onClick={handleAdd}
            className="bg-primary-container text-on-primary px-lg py-sm rounded-full font-label-md text-label-md flex items-center gap-2 hover:bg-primary transition-colors shadow-sm hover:shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            Daftarkan Petani Pertama
          </button>
        </div>

        <FarmerFormModal
          open={modalOpen}
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      </div>
    )
  }

  // ── Data State ──────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-md">
      {/* Page Header */}
      <div className="mb-md flex justify-between items-end gap-md flex-wrap">
        <div>
          <h2 className="font-display-lg text-display-lg text-primary mb-xs">
            Direktori Petani
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Kelola dan pantau aktivitas petani cabai yang terdaftar di wilayah
            desa Anda.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-primary-container text-on-primary px-sm py-2 rounded-full font-label-md text-label-md flex items-center gap-2 hover:bg-primary transition-colors shadow-sm hover:shadow-md active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          Tambah Petani Baru
        </button>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container rounded-lg px-md py-sm font-label-md text-label-md">
          {error}
        </div>
      )}

      <FarmerKPICards farmers={farmers} />

      {loading ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-xl text-center text-on-surface-variant">
          Memuat data...
        </div>
      ) : (
        <FarmerTable
          farmers={farmers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <FarmerFormModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}