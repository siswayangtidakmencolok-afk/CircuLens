interface SidebarProps {
  activePage: string
  onNavigate: (page: string) => void
}

const navItems = [
  { id: 'dashboard',    icon: 'dashboard',    label: 'Dashboard' },
  { id: 'new-batch',    icon: 'add_chart',    label: 'Analisis Baru' },
  { id: 'batches',      icon: 'inventory_2',  label: 'Batch' },
  { id: 'history',      icon: 'history',      label: 'Riwayat' },
  { id: 'scenarios',    icon: 'psychology',   label: 'Rekomendasi' },
  { id: 'settings',     icon: 'settings',     label: 'Pengaturan' },
]

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <nav className="fixed left-0 top-0 h-full w-[280px] bg-surface-container-lowest border-r border-outline-variant shadow-sm flex flex-col py-xl px-md z-40 hidden md:flex">
      {/* Logo */}
      <div className="flex items-center gap-sm mb-xl">
        <span className="material-symbols-outlined fill text-primary text-3xl">psychology</span>
        <div>
          <h1 className="text-headline-md font-bold text-primary tracking-tight">CircuLens</h1>
          <p className="text-label-md text-on-surface-variant">AgTech Precision</p>
        </div>
      </div>

      {/* Nav items */}
      <ul className="flex flex-col gap-sm flex-1 list-none m-0 p-0">
        {navItems.map(item => {
          const isActive = activePage === item.id
          return (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-md px-md py-sm rounded-lg transition-colors duration-150 text-left
                  ${isActive
                    ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-low'
                    : 'text-secondary hover:bg-surface-container-low border-r-4 border-transparent'
                  }`}
              >
                <span className={`material-symbols-outlined${isActive ? ' fill' : ''}`}>{item.icon}</span>
                <span className="text-body-md">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {/* Status */}
      <div className="mt-auto pt-md border-t border-outline-variant">
        <div className="flex items-center gap-sm px-sm py-sm text-secondary">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>wifi</span>
          <span className="text-label-md">System Status: Online</span>
        </div>
        <div className="flex items-center gap-sm px-sm py-xs">
          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">⚗️ Prototype AI — Demo Mode</span>
        </div>
      </div>
    </nav>
  )
}
