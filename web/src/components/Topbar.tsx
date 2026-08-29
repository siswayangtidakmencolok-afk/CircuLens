import { useAuth } from '../context/AuthContext'

interface TopbarProps {
  onNewBatch: () => void
  onMenuToggle: () => void
}

export default function Topbar({ onNewBatch, onMenuToggle }: TopbarProps) {
  const { user, profile, signOut } = useAuth()

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'
  const initial     = displayName.charAt(0).toUpperCase()

  return (
    <header className="bg-surface border-b border-outline-variant flex justify-between items-center w-full px-md md:px-xl py-md sticky top-0 z-30">
      {/* Mobile: logo + menu */}
      <div className="flex items-center gap-md md:hidden">
        <button
          onClick={onMenuToggle}
          className="text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="text-headline-sm font-extrabold text-primary">CircuLens</h2>
      </div>

      {/* Desktop spacer */}
      <div className="hidden md:flex flex-1" />

      {/* Right */}
      <div className="flex items-center gap-md md:gap-lg">
        <button
          className="text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>

        {/* User info */}
        <div className="flex items-center gap-sm">
          <div className="hidden md:block text-right">
            <p className="text-body-sm font-semibold text-on-surface leading-none">{displayName}</p>
            {user?.email && (
              <p className="text-[11px] text-secondary mt-0.5">{user.email}</p>
            )}
          </div>
          {/* Avatar with initial */}
          <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-body-sm shrink-0">
            {initial}
          </div>
        </div>

        {/* Analisis Baru */}
        <button
          onClick={onNewBatch}
          className="bg-primary-container text-on-primary-container text-label-md font-semibold px-lg py-sm rounded-full flex items-center gap-xs hover:bg-primary hover:text-on-primary transition-colors shadow-sm active:scale-95 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          + Analisis Baru
        </button>

        {/* Logout */}
        <button
          onClick={signOut}
          className="flex items-center gap-xs text-secondary hover:text-error transition-colors text-body-sm font-semibold"
          aria-label="Logout"
          title="Keluar"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span className="hidden md:inline">Keluar</span>
        </button>
      </div>
    </header>
  )
}
