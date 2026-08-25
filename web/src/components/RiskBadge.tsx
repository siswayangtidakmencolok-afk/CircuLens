import type { RiskLevel } from '../data/mockData'

const styles: Record<RiskLevel, string> = {
  Rendah: 'bg-surface-container-low text-primary ring-1 ring-inset ring-primary/20',
  Sedang: 'bg-secondary-container text-on-secondary-container ring-1 ring-inset ring-secondary/20',
  Tinggi: 'bg-error-container text-on-error-container ring-1 ring-inset ring-error/20',
}

export default function RiskBadge({ risk }: { risk: RiskLevel }) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${styles[risk]}`}>
      {risk}
    </span>
  )
}
