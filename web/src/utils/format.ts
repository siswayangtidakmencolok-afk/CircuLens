export const formatRupiah = (n: number): string =>
  `Rp ${new Intl.NumberFormat('id-ID').format(n)}`

export const formatDate = (iso: string): string => {
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const SOURCE_LABEL: Record<string, string> = {
  koperasi_desa: 'Koperasi Desa',
  pasar:         'Pasar',
  distributor:   'Distributor',
  lainnya:       'Lainnya',
}

export const SOURCE_COLORS: Record<string, string> = {
  koperasi_desa: 'bg-primary/10 text-primary',
  pasar:         'bg-tertiary/10 text-tertiary',
  distributor:   'bg-secondary-container/60 text-on-secondary-container',
  lainnya:       'bg-surface-container-high text-on-surface-variant',
}
