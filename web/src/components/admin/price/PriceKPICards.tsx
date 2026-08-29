import { formatRupiah } from '../../utils/format';
import { usePriceTrend } from '../../../hooks/usePriceTrend';
import type { CropPrice } from '../../../hooks/useCropPrices';

interface Props {
  prices: CropPrice[];
}

export function PriceKPICards({ prices }: Props) {
  const trend = usePriceTrend(prices);

  if (!trend) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-xl">
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-md">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
            Belum ada data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-md hover:shadow-sm transition-shadow duration-300 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-container opacity-5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
        <div className="flex justify-between items-start mb-sm relative z-10">
          <div className="p-3 bg-surface-container-low rounded-xl text-primary">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              eco
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-leaf-accent/20 text-on-secondary-container font-label-sm text-label-sm rounded-full">
            <span className="material-symbols-outlined text-[14px]">
              {trend.direction === 'up' ? 'arrow_upward' : trend.direction === 'down' ? 'arrow_downward' : 'remove'}
            </span>
            {trend.changePercent > 0 ? '+' : ''}
            {trend.changePercent}%
          </span>
        </div>
        <div className="relative z-10">
          <p className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wide">
            Harga Cabai Hari Ini
          </p>
          <p className="font-headline-md text-headline-md text-primary font-bold">
            {formatRupiah(trend.current)}{' '}
            <span className="font-body-md text-body-md font-normal text-on-surface-variant">/ kg</span>
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-md hover:shadow-sm transition-shadow duration-300 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary-container opacity-5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
        <div className="flex justify-between items-start mb-sm relative z-10">
          <div className="p-3 bg-surface-container-low rounded-xl text-tertiary">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              monitoring
            </span>
          </div>
        </div>
        <div className="relative z-10">
          <p className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wide">
            Rata-rata 7 Hari
          </p>
          <p className="font-headline-md text-headline-md text-on-surface font-bold">
            {formatRupiah(trend.average7d)}
          </p>
          <p className="font-label-sm text-label-sm text-outline mt-2">
            {trend.total} entri tercatat
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-md hover:shadow-sm transition-shadow duration-300 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-container opacity-5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
        <div className="flex justify-between items-start mb-sm relative z-10">
          <div className="p-3 bg-surface-container-low rounded-xl text-secondary">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              trending_up
            </span>
          </div>
        </div>
        <div className="relative z-10">
          <p className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wide">
            Harga Tertinggi
          </p>
          <p className="font-headline-md text-headline-md text-on-surface font-bold">
            {formatRupiah(Math.max(...prices.map((p) => Number(p.price))))}
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-md hover:shadow-sm transition-shadow duration-300 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-error-container opacity-10 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
        <div className="flex justify-between items-start mb-sm relative z-10">
          <div className="p-3 bg-error-container/30 rounded-xl text-on-error-container">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              trending_down
            </span>
          </div>
        </div>
        <div className="relative z-10">
          <p className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wide">
            Harga Terendah
          </p>
          <p className="font-headline-md text-headline-md text-on-surface font-bold">
            {formatRupiah(Math.min(...prices.map((p) => Number(p.price))))}
          </p>
        </div>
      </div>
    </div>
  );
}
