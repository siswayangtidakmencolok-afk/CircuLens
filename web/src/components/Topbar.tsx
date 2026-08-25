interface TopbarProps {
  onNewBatch: () => void
  onMenuToggle: () => void
}

export default function Topbar({ onNewBatch, onMenuToggle }: TopbarProps) {
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

      {/* Desktop: spacer */}
      <div className="hidden md:flex flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-md md:gap-xl">
        <button
          className="text-on-surface-variant hover:text-primary transition-all duration-200"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <div className="flex items-center gap-sm">
          <div className="hidden md:block text-right mr-sm">
            <p className="text-label-md text-on-surface">Admin Desa</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary">person</span>
          </div>
        </div>

        <button
          onClick={onNewBatch}
          className="bg-primary-container text-on-primary-container text-label-md font-semibold px-lg py-sm rounded-full flex items-center gap-sm hover:bg-primary hover:text-on-primary transition-colors shadow-sm active:scale-95 duration-150 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          + Analisis Baru
        </button>
      </div>
    </header>
  )
}
