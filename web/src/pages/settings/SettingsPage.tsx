import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'

type TabId = 'account' | 'village' | 'appearance' | 'notifications' | 'security'

interface Tab {
  id: TabId
  label: string
  icon: string
}

const TABS: Tab[] = [
  { id: 'account', label: 'Detail Akun', icon: 'manage_accounts' },
  { id: 'village', label: 'Profil Desa', icon: 'nature_people' },
  { id: 'appearance', label: 'Tampilan', icon: 'palette' },
  { id: 'notifications', label: 'Notifikasi & Peringatan', icon: 'notifications_active' },
  { id: 'security', label: 'Keamanan & Log', icon: 'security' },
]

interface AccountForm {
  full_name: string
  nip: string
  email: string
  phone: string
}

interface VillageForm {
  village_name: string
  district: string
  province: string
  total_dusun: number
}

interface NotificationPrefs {
  enable_email: boolean
  enable_whatsapp: boolean
  enable_push: boolean
  alert_critical: boolean
  alert_warning: boolean
  weekly_digest: boolean
}

export function SettingsPage() {
  const { profile, refreshProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<TabId>('account')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  // Account form state
  const [accountForm, setAccountForm] = useState<AccountForm>({
    full_name: '',
    nip: '',
    email: '',
    phone: '',
  })

  // Village form state
  const [villageForm, setVillageForm] = useState<VillageForm>({
    village_name: 'Desa Sukatani',
    district: 'Kabupaten Bogor',
    province: 'Jawa Barat',
    total_dusun: 4,
  })

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    enable_email: true,
    enable_whatsapp: true,
    enable_push: false,
    alert_critical: true,
    alert_warning: true,
    weekly_digest: true,
  })

  useEffect(() => {
    if (profile) {
      setAccountForm({
        full_name: profile.full_name ?? '',
        nip: (profile as { nip?: string }).nip ?? '',
        email: profile.email ?? '',
        phone: (profile as { phone?: string }).phone ?? '',
      })
    }
  }, [profile])

  async function handleSaveAccount(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: accountForm.full_name,
          email: accountForm.email,
          // nip & phone disimpan di kolom custom kalau ada
        } as Record<string, unknown>)
        .eq('id', profile.id)

      if (error) throw error
      await refreshProfile?.()
      setMessage({ kind: 'success', text: 'Detail akun berhasil diperbarui.' })
    } catch (err) {
      setMessage({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Gagal menyimpan',
      })
    } finally {
      setSaving(false)
    }
  }

  function handleSaveVillage(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    // Simulasi save (bisa diintegrasikan ke tabel village_settings kalau ada)
    setTimeout(() => {
      setSaving(false)
      setMessage({ kind: 'success', text: 'Profil desa berhasil disimpan.' })
    }, 600)
  }

  function handleSaveNotifications() {
    setMessage({ kind: 'success', text: 'Preferensi notifikasi disimpan.' })
  }

  return (
    <div className="p-md md:p-lg max-w-[1440px] mx-auto w-full">
      {/* Header */}
      <div className="mb-lg">
        <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-xs">
          Pengaturan Sistem
        </h2>
        <p className="text-on-surface-variant text-body-lg">
          Kelola profil desa, preferensi akun, dan log aktivitas sistem.
        </p>
      </div>

      {message && (
        <div
          className={`mb-md px-md py-sm rounded-lg font-label-md ${
            message.kind === 'success'
              ? 'bg-secondary-container/30 text-primary-container'
              : 'bg-error-container text-on-error-container'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column: Profile + Tabs */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          {/* Profile Summary */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-md">
            <div className="flex items-center gap-md mb-md">
              <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xl border-2 border-primary">
                {accountForm.full_name
                  ? accountForm.full_name
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((w) => w[0]?.toUpperCase() ?? '')
                      .join('')
                  : '??'}
              </div>
              <div className="min-w-0">
                <h3 className="font-headline-md text-headline-md text-primary truncate">
                  {accountForm.full_name || 'Pengguna'}
                </h3>
                <p className="text-on-surface-variant font-label-md truncate">
                  {profile?.role === 'village_head' ? 'Kepala Desa' : 'Pengguna'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('account')}
              className="w-full bg-primary-container text-on-primary py-xs px-md rounded-full font-label-md hover:bg-primary transition-colors flex items-center justify-center gap-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Profil
            </button>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-sm flex flex-col">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-md p-md rounded-md font-label-md text-left w-full transition-colors ${
                    isActive
                      ? 'bg-secondary-container/20 text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Column: Active Tab Content */}
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          {activeTab === 'account' && (
            <AccountTab
              form={accountForm}
              setForm={setAccountForm}
              saving={saving}
              onSubmit={handleSaveAccount}
              role={profile?.role}
            />
          )}

          {activeTab === 'village' && (
            <VillageTab
              form={villageForm}
              setForm={setVillageForm}
              saving={saving}
              onSubmit={handleSaveVillage}
            />
          )}

          {activeTab === 'appearance' && (
            <AppearanceTab theme={theme} onToggle={toggleTheme} />
          )}

          {activeTab === 'notifications' && (
            <NotificationsTab
              prefs={notifPrefs}
              setPrefs={setNotifPrefs}
              onSave={handleSaveNotifications}
            />
          )}

          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  )
}

// ─── Account Tab ─────────────────────────────────
function AccountTab({
  form,
  setForm,
  saving,
  onSubmit,
  role,
}: {
  form: AccountForm
  setForm: (f: AccountForm) => void
  saving: boolean
  onSubmit: (e: React.FormEvent) => void
  role?: string
}) {
  return (
    <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-lg">
      <div className="flex items-center justify-between mb-lg border-b border-outline-variant pb-sm">
        <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-xs">
          <span className="material-symbols-outlined text-primary">manage_accounts</span>
          Detail Akun
        </h3>
        <span className="bg-secondary-fixed text-on-secondary-fixed font-label-sm px-xs py-base rounded-full">
          {role === 'village_head' ? 'Admin Utama' : 'Pengguna'}
        </span>
      </div>
      <form onSubmit={onSubmit} className="space-y-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Nama Lengkap</label>
            <input
              type="text"
              className="rounded-full border border-outline-variant bg-surface-container-low focus:border-primary-container focus:ring-1 focus:ring-primary-container px-md py-xs text-on-surface"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">NIP / ID Pegawai</label>
            <input
              type="text"
              className="rounded-full border border-outline-variant bg-surface-container-low focus:border-primary-container focus:ring-1 focus:ring-primary-container px-md py-xs text-on-surface"
              value={form.nip}
              onChange={(e) => setForm({ ...form, nip: e.target.value })}
              placeholder="19800512 201001 1 003"
            />
          </div>
        </div>
        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface">Email Dinas</label>
          <input
            type="email"
            className="rounded-full border border-outline-variant bg-surface-container-low focus:border-primary-container focus:ring-1 focus:ring-primary-container px-md py-xs text-on-surface"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface">Nomor Telepon (WhatsApp Aktif)</label>
          <input
            type="tel"
            className="rounded-full border border-outline-variant bg-surface-container-low focus:border-primary-container focus:ring-1 focus:ring-primary-container px-md py-xs text-on-surface"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+62 812-3456-7890"
          />
        </div>
        <div className="pt-md flex justify-end gap-sm">
          <button
            type="button"
            className="px-md py-xs rounded-full font-label-md text-primary border border-outline-variant hover:bg-surface-container-low transition-colors"
            onClick={() => window.location.reload()}
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-md py-xs rounded-full font-label-md bg-primary-container text-on-primary hover:bg-primary transition-colors disabled:opacity-60 inline-flex items-center gap-xs"
          >
            {saving && (
              <span className="material-symbols-outlined text-base animate-spin">
                progress_activity
              </span>
            )}
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Village Tab ───────────────────────────────
function VillageTab({
  form,
  setForm,
  saving,
  onSubmit,
}: {
  form: VillageForm
  setForm: (f: VillageForm) => void
  saving: boolean
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-lg">
      <div className="flex items-center justify-between mb-lg border-b border-outline-variant pb-sm">
        <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-xs">
          <span className="material-symbols-outlined text-primary">nature_people</span>
          Profil Desa
        </h3>
      </div>
      <form onSubmit={onSubmit} className="space-y-md">
        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface">Nama Desa</label>
          <input
            type="text"
            className="rounded-full border border-outline-variant bg-surface-container-low focus:border-primary-container focus:ring-1 focus:ring-primary-container px-md py-xs text-on-surface"
            value={form.village_name}
            onChange={(e) => setForm({ ...form, village_name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Kabupaten</label>
            <input
              type="text"
              className="rounded-full border border-outline-variant bg-surface-container-low focus:border-primary-container focus:ring-1 focus:ring-primary-container px-md py-xs text-on-surface"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Provinsi</label>
            <input
              type="text"
              className="rounded-full border border-outline-variant bg-surface-container-low focus:border-primary-container focus:ring-1 focus:ring-primary-container px-md py-xs text-on-surface"
              value={form.province}
              onChange={(e) => setForm({ ...form, province: e.target.value })}
            />
          </div>
        </div>
        <div className="flex flex-col gap-xs">
          <label className="font-label-md text-on-surface">Jumlah Dusun</label>
          <input
            type="number"
            min={1}
            max={50}
            className="rounded-full border border-outline-variant bg-surface-container-low focus:border-primary-container focus:ring-1 focus:ring-primary-container px-md py-xs text-on-surface"
            value={form.total_dusun}
            onChange={(e) =>
              setForm({ ...form, total_dusun: Number(e.target.value) || 0 })
            }
          />
        </div>
        <div className="pt-md flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-md py-xs rounded-full font-label-md bg-primary-container text-on-primary hover:bg-primary transition-colors disabled:opacity-60"
          >
            Simpan Profil Desa
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Appearance Tab (Dark/Light Mode) ─────────
function AppearanceTab({
  theme,
  onToggle,
}: {
  theme: 'light' | 'dark'
  onToggle: () => void
}) {
  return (
    <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-lg">
      <div className="flex items-center justify-between mb-lg border-b border-outline-variant pb-sm">
        <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-xs">
          <span className="material-symbols-outlined text-primary">palette</span>
          Tampilan
        </h3>
      </div>

      <div className="space-y-md">
        {/* Theme Selector */}
        <div>
          <label className="font-label-md text-on-surface mb-sm block">
            Mode Tema
          </label>
          <div className="grid grid-cols-2 gap-md">
            <button
              onClick={() => theme !== 'light' && onToggle()}
              className={`p-md rounded-lg border-2 transition-all text-left ${
                theme === 'light'
                  ? 'border-primary bg-secondary-container/30'
                  : 'border-outline-variant bg-surface-container-low hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-md mb-sm">
                <span
                  className={`material-symbols-outlined text-2xl ${
                    theme === 'light' ? 'text-primary' : 'text-on-surface-variant'
                  }`}
                  style={{
                    fontVariationSettings:
                      theme === 'light' ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  light_mode
                </span>
                <span className="font-label-md text-label-md text-primary">
                  Terang
                </span>
                {theme === 'light' && (
                  <span className="ml-auto material-symbols-outlined text-primary">
                    check_circle
                  </span>
                )}
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Cocok untuk siang hari dan pencahayaan terang.
              </p>
            </button>

            <button
              onClick={() => theme !== 'dark' && onToggle()}
              className={`p-md rounded-lg border-2 transition-all text-left ${
                theme === 'dark'
                  ? 'border-primary bg-secondary-container/30'
                  : 'border-outline-variant bg-surface-container-low hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-md mb-sm">
                <span
                  className={`material-symbols-outlined text-2xl ${
                    theme === 'dark' ? 'text-primary' : 'text-on-surface-variant'
                  }`}
                  style={{
                    fontVariationSettings:
                      theme === 'dark' ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  dark_mode
                </span>
                <span className="font-label-md text-label-md text-primary">
                  Gelap
                </span>
                {theme === 'dark' && (
                  <span className="ml-auto material-symbols-outlined text-primary">
                    check_circle
                  </span>
                )}
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Mengurangi kelelahan mata di malam hari.
              </p>
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-surface-container-low rounded-lg p-md">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-sm">
            Preview
          </p>
          <div className="flex gap-sm flex-wrap">
            <div className="px-sm py-xs bg-primary-container text-on-primary rounded-full text-label-sm">
              Primary
            </div>
            <div className="px-sm py-xs bg-secondary-container text-on-secondary-container rounded-full text-label-sm">
              Secondary
            </div>
            <div className="px-sm py-xs bg-error-container text-on-error-container rounded-full text-label-sm">
              Error
            </div>
            <div className="px-sm py-xs bg-surface-container-highest text-on-surface rounded-full text-label-sm border border-outline-variant">
              Surface
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Notifications Tab ────────────────────────
function NotificationsTab({
  prefs,
  setPrefs,
  onSave,
}: {
  prefs: NotificationPrefs
  setPrefs: (p: NotificationPrefs) => void
  onSave: () => void
}) {
  return (
    <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-lg">
      <div className="flex items-center justify-between mb-lg border-b border-outline-variant pb-sm">
        <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-xs">
          <span className="material-symbols-outlined text-primary">
            notifications_active
          </span>
          Notifikasi & Peringatan
        </h3>
      </div>

      <div className="space-y-md">
        <div>
          <p className="font-label-md text-on-surface mb-sm">Channel Notifikasi</p>
          <div className="space-y-sm">
            <ToggleRow
              label="Email"
              description="Terima notifikasi via email dinas"
              checked={prefs.enable_email}
              onChange={(v) => setPrefs({ ...prefs, enable_email: v })}
              icon="mail"
            />
            <ToggleRow
              label="WhatsApp"
              description="Terima notifikasi via WhatsApp (recommended)"
              checked={prefs.enable_whatsapp}
              onChange={(v) => setPrefs({ ...prefs, enable_whatsapp: v })}
              icon="chat"
            />
            <ToggleRow
              label="Push Browser"
              description="Notifikasi real-time di browser"
              checked={prefs.enable_push}
              onChange={(v) => setPrefs({ ...prefs, enable_push: v })}
              icon="notifications"
            />
          </div>
        </div>

        <div className="pt-md border-t border-outline-variant">
          <p className="font-label-md text-on-surface mb-sm">
            Jenis Alert
          </p>
          <div className="space-y-sm">
            <ToggleRow
              label="Alert Kritis"
              description="Risiko tinggi yang butuh tindakan segera"
              checked={prefs.alert_critical}
              onChange={(v) => setPrefs({ ...prefs, alert_critical: v })}
              icon="error"
            />
            <ToggleRow
              label="Alert Peringatan"
              description="Risiko sedang yang perlu dipantau"
              checked={prefs.alert_warning}
              onChange={(v) => setPrefs({ ...prefs, alert_warning: v })}
              icon="warning"
            />
            <ToggleRow
              label="Weekly Digest"
              description="Ringkasan mingguan via email"
              checked={prefs.weekly_digest}
              onChange={(v) => setPrefs({ ...prefs, weekly_digest: v })}
              icon="summarize"
            />
          </div>
        </div>

        <div className="pt-md flex justify-end">
          <button
            onClick={onSave}
            className="px-md py-xs rounded-full font-label-md bg-primary-container text-on-primary hover:bg-primary transition-colors"
          >
            Simpan Preferensi
          </button>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  icon,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
  icon: string
}) {
  return (
    <label className="flex items-center justify-between p-sm rounded-lg hover:bg-surface-container-low cursor-pointer">
      <div className="flex items-center gap-md">
        <span className="material-symbols-outlined text-on-surface-variant">
          {icon}
        </span>
        <div>
          <p className="font-label-md text-label-md text-primary">{label}</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            {description}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          onChange(!checked)
        }}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-primary-container' : 'bg-surface-container-high'
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-on-primary shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}

// ─── Security Tab ──────────────────────────────
function SecurityTab() {
  return (
    <div className="space-y-gutter">
      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-lg">
        <div className="flex items-center justify-between mb-lg border-b border-outline-variant pb-sm">
          <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary">security</span>
            Keamanan
          </h3>
        </div>
        <div className="space-y-md">
          <button className="w-full flex items-center justify-between p-md rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors text-left">
            <div>
              <p className="font-label-md text-label-md text-primary">
                Ubah Password
              </p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Update password akun Anda
              </p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">
              chevron_right
            </span>
          </button>
          <button className="w-full flex items-center justify-between p-md rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors text-left">
            <div>
              <p className="font-label-md text-label-md text-primary">
                Two-Factor Authentication
              </p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Tambahkan lapisan keamanan ekstra
              </p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">
              chevron_right
            </span>
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-lg">
        <h3 className="font-headline-md text-headline-md text-primary mb-lg">
          Aktivitas Login Terakhir
        </h3>
        <div className="space-y-sm">
          <ActivityRow
            device="Chrome di Windows"
            location="Bogor, Indonesia"
            time="Sekarang"
            isCurrent
          />
          <ActivityRow
            device="Chrome di Android"
            location="Bogor, Indonesia"
            time="2 jam lalu"
          />
          <ActivityRow
            device="Safari di iOS"
            location="Jakarta, Indonesia"
            time="Kemarin"
          />
        </div>
      </div>
    </div>
  )
}

function ActivityRow({
  device,
  location,
  time,
  isCurrent,
}: {
  device: string
  location: string
  time: string
  isCurrent?: boolean
}) {
  return (
    <div className="flex items-center justify-between p-sm rounded-lg bg-surface-container-low">
      <div className="flex items-center gap-md">
        <span className="material-symbols-outlined text-on-surface-variant">
          devices
        </span>
        <div>
          <p className="font-label-md text-label-md text-primary">
            {device}
            {isCurrent && (
              <span className="ml-sm text-label-sm bg-secondary-container/30 text-primary-container px-xs py-base rounded-full">
                Sesi ini
              </span>
            )}
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            {location}
          </p>
        </div>
      </div>
      <span className="font-label-sm text-label-sm text-on-surface-variant">
        {time}
      </span>
    </div>
  )
}