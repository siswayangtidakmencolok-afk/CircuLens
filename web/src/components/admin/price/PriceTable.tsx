import { useState } from 'react';
import { formatRupiah, formatDate, SOURCE_LABEL, SOURCE_COLORS } from '../../utils/format';
import type { CropPrice } from '../../../hooks/useCropPrices';

interface Props {
  prices: CropPrice[];
  onEdit: (p: CropPrice) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}

export function PriceTable({ prices, onEdit, onDelete, canEdit }: Props) {
  const [filter, setFilter] = useState('');

  const filtered = prices.filter(
    (p) =>
      p.crop_name.toLowerCase().includes(filter.toLowerCase()) ||
      (p.variety ?? '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-surface-container-lowest rounded-lg border border-outline-variant overflow-hidden">
      <div className="p-md border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-sm bg-surface-bright">
        <h3 className="font-headline-md text-headline-md text-on-surface">
          Riwayat Pencatatan Harga
        </h3>
        <input
          type="search"
          placeholder="Cari komoditas..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="form-input rounded-full border-outline-variant bg-surface-container-lowest px-md py-xs text-sm w-full md:w-64 focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-body-md text-body-md">
          <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase">
            <tr>
              <th className="px-md py-sm">Tanggal</th>
              <th className="px-md py-sm">Komoditas</th>
              <th className="px-md py-sm">Harga</th>
              <th className="px-md py-sm">Satuan</th>
              <th className="px-md py-sm">Sumber</th>
              <th className="px-md py-sm">Wilayah</th>
              {canEdit && <th className="px-md py-sm text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 7 : 6} className="px-md py-lg text-center text-on-surface-variant">
                  Belum ada data harga.
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-surface-container transition-colors">
                <td className="px-md py-sm">{formatDate(p.recorded_at)}</td>
                <td className="px-md py-sm">
                  <p className="font-label-md text-label-md text-on-surface">{p.crop_name}</p>
                  {p.variety && <p className="font-label-sm text-label-sm text-on-surface-variant">{p.variety}</p>}
                </td>
                <td className="px-md py-sm font-label-md text-label-md text-primary">
                  {formatRupiah(Number(p.price))}
                </td>
                <td className="px-md py-sm text-on-surface-variant">/ {p.unit}</td>
                <td className="px-md py-sm">
                  <span className={`px-2 py-1 rounded-full font-label-sm text-label-sm ${SOURCE_COLORS[p.source] ?? SOURCE_COLORS.lainnya}`}>
                    {SOURCE_LABEL[p.source]}
                  </span>
                </td>
                <td className="px-md py-sm text-on-surface-variant">{p.region ?? '-'}</td>
                {canEdit && (
                  <td className="px-md py-sm text-right">
                    <div className="flex justify-end gap-xs">
                      <button onClick={() => onEdit(p)} className="text-primary hover:bg-primary-container/20 rounded-md p-1 transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button onClick={() => onDelete(p.id)} className="text-error hover:bg-error-container/30 rounded-md p-1 transition-colors" title="Hapus">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
