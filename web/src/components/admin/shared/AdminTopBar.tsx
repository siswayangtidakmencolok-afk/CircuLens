import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'

interface Props {
  pageTitle: string
  breadcrumb?: string
  onLogout?: () => void
}

export function AdminTopBar({ pageTitle, breadcrumb, onLogout }: Props) {
  const { profile } = useAuth()
  const [search, setSearch] = useState('')
  const [showNotif, setShowNotif] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const userInitials = profile?.full_name
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') ?? '??'

  return (
    <header className="h-16 sticky top-0 z-30 bg-surface border-b border-outline-variant flex justify-between items-center px-xl">
      {/* Breadcrumb */}
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

      {/* Right Actions */}
      <div className="flex items-center gap-md">
        {/* Search */}
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-surface-container-low border border-outline-variant rounded-full pl-9 pr-4 py-2 text-sm font-body-md focus:ring-primary focus:border-primary text-on-surface-variant w-64 transition-all"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotif((v) => !v)
              setShowProfile(false)
            }}
            className="relative p-2 text-on-surface-variant hover:text-primary transition-colors active:opacity-70 rounded-full hover:bg-surface-container-low"
            aria-label="Notifikasi"
          >
            <span className="material-symbols-outlined">notifications</span>
            {/* Unread dot */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
          </button>
          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg z-50">
              <div className="px-md py-sm border-b border-outline-variant flex justify-between items-center">
                <h3 className="font-label-md text-label-md text-primary">
                  Notifikasi
                </h3>
                <button
                  onClick={() => setShowNotif(false)}
                  className="text-on-surface-variant hover:text-primary"
                >
                  <span className="material-symbols-outlined text-base">
                    close
                  </span>
                </button>
              </div>
              <div className="p-md text-center text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-4xl block mb-xs opacity-50">
                  notifications_off
                </span>
                Tidak ada notifikasi baru
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile((v) => !v)
              setShowNotif(false)
            }}
            className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm border border-outline-variant hover:border-primary transition-colors"
            aria-label="Profil"
          >
            {userInitials}
          </button>
          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg z-50">
              <div className="px-md py-sm border-b border-outline-variant">
                <p className="font-label-md text-label-md text-primary truncate">
                  {profile?.full_name ?? 'Pengguna'}
                </p>
                <p className="font-label-sm text-label-sm text-on-surface-variant truncate">
                  {profile?.email ?? 'admin@circulens.desa.id'}
                </p>
                <span className="inline-block mt-xs px-2 py-0.5 bg-secondary-container/30 text-primary-container text-label-sm rounded-full">
                  Kepala Desa
                </span>
              </div>
              <div className="p-xs">
                <button
                  onClick={() => {
                    setShowProfile(false)
                    onLogout?.()
                  }}
                  className="w-full flex items-center gap-md px-md py-sm rounded-lg text-error hover:bg-error-container/20 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-base">
                    logout
                  </span>
                  <span className="text-body-md">Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}