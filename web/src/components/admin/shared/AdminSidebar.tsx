import { useAuth } from '../../../context/AuthContext'

export type AdminMenuItem =
  | 'overview'
  | 'price-intelligence'
  | 'farmers'
  | 'risk'
  | 'batches'
  | 'reports'
  | 'village'
  | 'settings'

interface MenuItem {
  id: AdminMenuItem
  label: string
  icon: string
  enabled: boolean
  badge?: string
}

interface Props {
  activeMenu: AdminMenuItem
  onNavChange: (id: string) => void
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'overview', label: 'Overview', icon: 'dashboard', enabled: true },
  { id: 'price-intelligence', label: 'Harga Cabai', icon: 'payments', enabled: true },
  { id: 'farmers', label: 'Data Petani', icon: 'groups', enabled: true },
  { id: 'risk', label: 'Analisis Panen', icon: 'analytics', enabled: true },
  { id: 'batches', label: 'Semua Batch', icon: 'inventory_2', enabled: false },
  { id: 'reports', label: 'Laporan', icon: 'assessment', enabled: false },
  { id: 'village', label: 'Data Desa', icon: 'location_city', enabled: false },
  { id: 'settings', label: 'Pengaturan', icon: 'settings', enabled: false },
]

export function AdminSidebar({ activeMenu, onNavChange }: Props) {
  const { profile } = useAuth()
  const userInitials = profile?.full_name
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') ?? '??'

  return (
    <nav className="fixed left-0 top-0 h-full w-[280px] bg-surface-container-lowest border-r border-outline-variant shadow-sm flex flex-col py-xl px-md z-40 hidden md:flex">
      {/* Brand / Header */}
      <div className="flex items-center gap-sm mb-xl">
        <span
          className="material-symbols-outlined fill text-primary text-3xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          eco
        </span>
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
            CircuLens
          </h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Kepala Desa
          </p>
        </div>
      </div>

      {/* Profile Avatar (Optional) */}
      <div className="flex items-center gap-md px-sm py-sm mb-md bg-surface-container-low rounded-lg">
        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
          {userInitials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-label-md text-label-md text-primary truncate">
            {profile?.full_name ?? 'Pengguna'}
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant truncate">
            {profile?.email ?? 'admin@circulens.desa.id'}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <ul className="flex flex-col gap-sm flex-1 list-none m-0 p-0">
        {MENU_ITEMS.map((item) => {
          const isActive = activeMenu === item.id
          const isEnabled = item.enabled

          return (
            <li key={item.id}>
              <button
                onClick={() => isEnabled && onNavChange(item.id)}
                disabled={!isEnabled}
                className={`w-full flex items-center gap-md px-md py-sm rounded-lg transition-colors text-left ${
                  isActive
                    ? 'bg-secondary-container/30 text-primary font-bold border-r-4 border-primary'
                    : isEnabled
                    ? 'text-secondary hover:bg-surface-container-low'
                    : 'text-outline opacity-50 cursor-not-allowed'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                <span className="text-body-md flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 bg-error text-on-error text-label-sm rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {/* Footer Help */}
      <div className="mt-auto pt-md border-t border-outline-variant">
        <button
          onClick={() => onNavChange('help')}
          className="w-full flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors text-left"
        >
          <span className="material-symbols-outlined">help_outline</span>
          <span className="text-body-md">Help Center</span>
        </button>
      </div>
    </nav>
  )
}