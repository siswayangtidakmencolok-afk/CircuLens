import { useState } from 'react';
import { useCropPrices, type CropPrice } from '../../hooks/useCropPrices';
import { useAuth } from '../../../context/AuthContext';
import { PriceKPICards } from './PriceKPICards';
import { PriceChart } from './PriceChart';
import { PriceTable } from './PriceTable';
import { PriceFormModal } from './PriceFormModal';

export function PriceManagement() {
  const { prices, loading, error, createPrice, updatePrice, deletePrice } = useCropPrices();
  const { profile } = useAuth();
  const isKepalaDesa = profile?.role === 'kepala_desa';

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CropPrice | null>(null);
  const [chartDays, setChartDays] = useState<7 | 30>(7);

  const handleEdit = (p: CropPrice) => {
    setEditing(p);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (editing) await updatePrice(editing.id, data);
    else await createPrice(data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data harga ini?')) return;
    await deletePrice(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-xl">
        <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-container/30 text-on-error-container p-md rounded-md border border-error-container">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-xl gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-xs">
            Intelijen Harga Pasar
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Pantau pergerakan harga komoditas cabai lokal untuk pengambilan keputusan strategis desa.
          </p>
        </div>
        {isKepalaDesa && (
          <button onClick={handleAdd} className="px-md py-sm bg-primary text-on-primary rounded-full font-label-md text-label-md hover:bg-primary-container transition-all flex items-center gap-xs shadow-sm hover:shadow-md">
            <span className="material-symbols-outlined">add</span>
            Tambah Harga
          </button>
        )}
      </div>

      <PriceKPICards prices={prices} />

      <div className="mb-xl">
        <PriceChart prices={prices} days={chartDays} onDaysChange={setChartDays} />
      </div>

      <PriceTable prices={prices} onEdit={handleEdit} onDelete={handleDelete} canEdit={isKepalaDesa} />

      <PriceFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} initialData={editing} />
    </div>
  );
}
