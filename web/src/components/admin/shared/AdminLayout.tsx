import type { ReactNode } from 'react'
import { AdminSidebar, type AdminMenuItem } from './AdminSidebar'
import { AdminTopBar } from './AdminTopBar'

interface Props {
  activeMenu: AdminMenuItem
  pageTitle: string
  breadcrumb?: string
  onNavChange?: (id: string) => void
  onLogout?: () => void
  children: ReactNode
  showSidebar?: boolean
  showTopBar?: boolean
}

export function AdminLayout({
  activeMenu,
  pageTitle,
  breadcrumb,
  onNavChange,
  onLogout,
  children,
  showSidebar = true,
  showTopBar = true,
}: Props) {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex antialiased">
      {/* Sidebar */}
      {showSidebar && onNavChange && (
        <AdminSidebar activeMenu={activeMenu} onNavChange={onNavChange} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-[280px] w-full overflow-hidden min-h-screen">
        {/* Topbar */}
        {showTopBar && (
          <AdminTopBar
            pageTitle={pageTitle}
            breadcrumb={breadcrumb}
            onLogout={onLogout}
          />
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-surface">{children}</main>
      </div>
    </div>
  )
}