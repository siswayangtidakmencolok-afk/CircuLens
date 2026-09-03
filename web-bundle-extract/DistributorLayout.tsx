import type { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useDistributorProfile } from '../../hooks/useDistributorProfile'

interface MenuItem {
  id: string
  label: string
  icon: string
  enabled: boolean
  badge?: string
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'distributor-home', label: 'Dashboard', icon: 'dashboard', enabled: true },
  { id: 'marketplace', label: 'Marketplace', icon: 'storefront', enabled: true, badge: 'Aktif' },
  { id: 'my-orders', label: 'Pesanan Saya', icon: 'receipt_long', enabled: true, badge: 'Aktif' },
  { id: 'favorites', label: 'Petani Favorit', icon: 'favorite', enabled: false },
  { id: 'analytics', label: 'Analisis Pembelian', icon: 'analytics', enabled: false },
  { id: 'settings', label: 'Pengaturan', icon: 'settings', enabled: false },
]

interface Props {
  activeMenu: string
  onNavChange: (id: string) => void
  pageTitle: string
  breadcrumb?: string
  children: ReactNode
  onLogout?: () => void
}

export function DistributorLayout({
  activeMenu,
  onNavChange,
  pageTitle,
  breadcrumb,
  children,
  onLogout,
}: Props) {
  const { profile: authProfile } = useAuth()
  const { profile: distributorProfile } = useDistributorProfile(authProfile?.id)

  const companyName = distributorProfile?.company_name ?? authProfile?.full_name ?? 'Distributor'
  const userInitials = companyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') ?? 'DS'

  return (
    <div className="bg-surface text-on-surface min-h-screen flex antialiased">
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 h-full w-[280px] bg-surface-container-lowest border-r border-outline-variant shadow-sm flex flex-col py-xl px-md z-40 hidden md:flex">
        {/* Brand */}
        <div className="flex items-center gap-sm mb-xl">
          <span
            className="material-symbols-outlined text-primary text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            storefront
          </span>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
              CircuLens
            </h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Distributor
            </p>
          </div>
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-md px-sm py-sm mb-md bg-surface-container-low rounded-lg">
          <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center font-bold text-sm">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-label-md text-label-md text-primary truncate">
              {companyName}
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant truncate">
              {distributorProfile?.is_verified ? '✓ Verified' : 'Unverified'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <ul className="flex flex-col gap-sm flex-1 list-none m-0 p-0 overflow-y-auto">
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
                    <span className="px-2 py-0.5 bg-primary-container text-on-primary text-label-sm rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        {/* Footer Logout */}
        <div className="mt-auto pt-md border-t border-outline-variant">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-md px-md py-sm rounded-lg text-error hover:bg-error-container/20 transition-colors text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-body-md">Keluar</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-[280px] w-full overflow-hidden min-h-screen">
        {/* Topbar */}
        <header className="h-16 sticky top-0 z-30 bg-surface border-b border-outline-variant flex justify-between items-center px-xl">
          <div className="flex items-center gap-sm min-w-0">
            <h2 className="font-headline-md text-headline-md font-bold text-primary truncate">
              {pageTitle}
            </h2>
            {breadcrumb && (
              <>
                <span className="text-outline-variant hidden sm:inline">/</span>
                <span className="text-on-surface-variant font-bold hidden sm:inline truncate">
                  {breadcrumb}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-md">
            <button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-low">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center font-bold text-sm">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-surface">{children}</main>
      </div>
    </div>
  )
}