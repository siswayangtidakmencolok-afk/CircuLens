import { useState, type FormEvent } from 'react'
import { useAuth, type UserRole } from '../context/AuthContext'

/* ──────────────────────────────────────────────────────────────────────────
 * LoginPage: RoleSelector → Login/Register
 *
 * Role selection is UI-only — it determines which form label is shown and
 * which role is passed to signUp. Authorization is ALWAYS read from
 * public.profiles.role in the database, never from this component.
 * ────────────────────────────────────────────────────────────────────────── */

type AuthStep = 'selector' | 'form'
type AuthMode = 'login' | 'register'

interface RoleOption {
  role:      UserRole
  title:     string
  icon:      string
  desc:      string
  features:  string[]
  accent:    string   // Tailwind ring color token
  btnClass:  string
  iconBg:    string
}

const ROLES: RoleOption[] = [
  {
    role:     'farmer',
    title:    'PETANI',
    icon:     'agriculture',
    desc:     'Analisis kondisi cabai dan tentukan apakah hasil panen sebaiknya dijual, disimpan, diproses, atau dialihkan.',
    features: [
      'Monitoring kondisi cabai',
      'Upload atau ambil foto tanaman',
      'Analisis kualitas AI',
      'Risiko food loss',
      'Rekomendasi jual/simpan/proses',
    ],
    accent:    'focus:ring-primary-container',
    btnClass:  'bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary',
    iconBg:    'bg-primary-container/20 text-primary',
  },
  {
    role:     'village_head',
    title:    'KEPALA DESA',
    icon:     'domain',
    desc:     'Pantau kondisi hasil panen, risiko kehilangan, dan ringkasan data pertanian wilayah.',
    features: [
      'Monitoring kondisi komoditas desa',
      'Statistik seluruh batch',
      'Risiko kehilangan hasil',
      'Monitoring petani',
      'Ringkasan harga dan distribusi',
    ],
    accent:    'focus:ring-tertiary-container',
    btnClass:  'border-2 border-secondary text-on-surface hover:bg-surface-container-high',
    iconBg:    'bg-tertiary-container/20 text-tertiary',
  },
]

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const [step,       setStep]     = useState<AuthStep>('selector')
  const [authMode,   setAuthMode] = useState<AuthMode>('login')
  const [role,       setRole]     = useState<UserRole>('farmer')
  const [email,      setEmail]    = useState('')
  const [password,   setPassword] = useState('')
  const [fullName,   setFullName] = useState('')
  const [error,      setError]    = useState<string | null>(null)
  const [info,       setInfo]     = useState<string | null>(null)
  const [loading,    setLoading]  = useState(false)
  const [googleLoad, setGoogleLoad] = useState(false)

  const selectedRole = ROLES.find(r => r.role === role) ?? ROLES[0]

  function selectRole(r: UserRole) {
    setRole(r)
    setError(null)
    setInfo(null)
    setStep('form')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    if (authMode === 'login') {
      const { error: err } = await signIn(email, password)
      if (err) setError(err)
    } else {
      if (!fullName.trim()) { setError('Nama lengkap wajib diisi.'); setLoading(false); return }
      const { error: err } = await signUp(email, password, fullName, role)
      if (err) setError(err)
      else setInfo('Pendaftaran berhasil! Cek email untuk konfirmasi, lalu login.')
    }
    setLoading(false)
  }

  async function handleGoogle() {
    setGoogleLoad(true)
    const { error: err } = await signInWithGoogle(role)
    if (err) { setError(err); setGoogleLoad(false) }
  }

  /* ── ROLE SELECTOR ─────────────────────────────────────────────────────── */
  if (step === 'selector') {
    return (
      <div
        className="min-h-[100dvh] flex flex-col font-sans text-on-surface antialiased"
        style={{
          background: '#FDFCFB',
          backgroundImage: 'radial-gradient(#d3e4fe 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      >
        {/* Header */}
        <header className="w-full flex justify-between items-center px-xl py-lg max-w-[1440px] mx-auto">
          <div className="flex items-center gap-sm">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}
            >
              eco
            </span>
            <span
              className="font-bold text-primary tracking-tight"
              style={{ fontSize: '22px', fontWeight: 800 }}
            >
              CircuLens
            </span>
          </div>
          <span className="hidden md:block text-label-md text-secondary uppercase tracking-widest">
            Circular Food Intelligence Platform
          </span>
        </header>

        {/* Hero */}
        <main className="flex-grow flex flex-col items-center justify-center px-lg md:px-xl py-xxl w-full max-w-[1200px] mx-auto">
          <div className="text-center mb-xxl max-w-3xl mx-auto">
            <h1
              className="text-primary mb-md"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(32px, 5vw, 52px)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Kelola hasil panen dengan keputusan yang lebih cerdas.
            </h1>
            <p className="text-body-lg text-secondary">
              Pantau kondisi cabai, risiko kehilangan, dan tentukan langkah terbaik dari satu tempat.
            </p>
          </div>

          {/* Role cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg w-full max-w-4xl mx-auto">
            {ROLES.map(rc => (
              <button
                key={rc.role}
                onClick={() => selectRole(rc.role)}
                className={`text-left flex flex-col justify-between p-xl rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm group focus:outline-none ${rc.accent} focus:ring-4
                  transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/60`}
                style={{ minHeight: '280px' }}
              >
                <div>
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-lg ${rc.iconBg} transition-all duration-300 group-hover:scale-105`}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '36px', fontVariationSettings: "'FILL' 1" }}
                    >
                      {rc.icon}
                    </span>
                  </div>
                  <h2 className="text-headline-lg font-bold text-on-surface mb-sm">{rc.title}</h2>
                  <p className="text-body-md text-secondary mb-lg">{rc.desc}</p>
                </div>

                {/* Feature list */}
                <ul className="flex flex-col gap-xs mb-xl">
                  {rc.features.map(f => (
                    <li key={f} className="flex items-start gap-sm text-body-sm text-on-surface-variant">
                      <span
                        className={rc.role === 'farmer' ? 'text-primary' : 'text-tertiary'}
                        style={{ fontFamily: 'Material Symbols Outlined', fontSize: '18px' }}
                      >
                        check_circle
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <div
                  className={`inline-flex items-center gap-xs text-label-md font-bold py-md px-lg rounded-full w-max transition-all duration-200 group-hover:translate-x-1 ${rc.btnClass}`}
                >
                  Masuk sebagai {rc.title}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </button>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-surface-container-low border-t border-outline-variant w-full mt-auto">
          <div className="flex flex-col md:flex-row justify-between items-center px-xl py-lg w-full max-w-[1440px] mx-auto gap-sm">
            <p className="font-bold text-primary text-body-sm">CircuLens</p>
            <p className="text-body-sm text-on-surface-variant">
              © 2026 CircuLens AgTech Solutions. All rights reserved.
            </p>
            <div className="flex gap-lg">
              {['Privacy Policy', 'Terms of Service', 'Contact'].map(l => (
                <a key={l} href="#" className="text-body-sm text-on-surface-variant hover:underline opacity-80 hover:opacity-100 transition-opacity">
                  {l}
                </a>
              ))}
            </div>
          </div>
          <p className="text-center text-body-sm text-secondary py-sm pb-lg flex items-center justify-center gap-xs">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock</span>
            Data aman. Akses disesuaikan dengan peran pengguna.
          </p>
        </footer>
      </div>
    )
  }

  /* ── LOGIN / REGISTER FORM ─────────────────────────────────────────────── */
  return (
    <div className="min-h-[100dvh] bg-surface flex items-center justify-center p-md">
      <div className="w-full max-w-sm">

        {/* Back */}
        <button
          onClick={() => { setStep('selector'); setError(null); setInfo(null) }}
          className="flex items-center gap-xs text-secondary hover:text-primary transition-colors mb-lg text-body-sm font-semibold"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Ganti peran
        </button>

        {/* Logo */}
        <div className="text-center mb-xl">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-md shadow-md">
            <span
              className="material-symbols-outlined text-on-primary fill"
              style={{ fontSize: '30px', fontVariationSettings: "'FILL' 1" }}
            >
              eco
            </span>
          </div>
          <h1 className="cl-headline text-on-surface">CircuLens</h1>
          <div className={`inline-flex items-center gap-xs mt-sm px-3 py-1 rounded-full text-label-md font-bold ${selectedRole.iconBg}`}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}
            >
              {selectedRole.icon}
            </span>
            {selectedRole.title}
          </div>
        </div>

        <div className="cl-card">
          {/* Mode toggle */}
          <div className="flex rounded-xl bg-surface-container-low p-1 mb-lg">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setAuthMode(m); setError(null); setInfo(null) }}
                className={`flex-1 py-sm text-body-sm font-bold rounded-lg transition-colors ${authMode === m ? 'bg-white text-primary shadow-sm' : 'text-secondary'}`}
              >
                {m === 'login' ? 'Masuk' : 'Daftar'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-md">
            {authMode === 'register' && (
              <div className="flex flex-col gap-xs">
                <label className="cl-label text-secondary">Nama Lengkap</label>
                <input
                  type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="cth: Budi Santoso" required
                  className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            )}

            <div className="flex flex-col gap-xs">
              <label className="cl-label text-secondary">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="email@contoh.com" required
                className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="cl-label text-secondary">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 karakter" required minLength={6}
                className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            {error && (
              <div className="bg-error-container text-on-error-container text-body-sm px-md py-sm rounded-xl flex items-center gap-sm">
                <span className="material-symbols-outlined text-base">error</span>
                {error}
              </div>
            )}
            {info && (
              <div className="bg-green-50 text-green-800 border border-green-200 text-body-sm px-md py-sm rounded-xl flex items-start gap-sm">
                <span className="material-symbols-outlined text-base text-green-600 shrink-0">check_circle</span>
                {info}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-primary text-on-primary py-sm rounded-full text-body-md font-bold hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />Memproses...</>
              ) : authMode === 'login' ? (
                <><span className="material-symbols-outlined text-base">login</span>Masuk</>
              ) : (
                <><span className="material-symbols-outlined text-base">person_add</span>Buat Akun</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-sm my-md">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="cl-label text-secondary">atau</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle} disabled={googleLoad}
            className="w-full flex items-center justify-center gap-sm border border-outline-variant rounded-full py-sm px-md text-body-sm font-semibold text-on-surface hover:bg-surface-container-low active:scale-95 transition-all disabled:opacity-50"
          >
            {googleLoad ? (
              <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#4285F4" d="M24 9.5c3.1 0 5.9 1.1 8 2.9l6-6C34.4 3.2 29.5 1 24 1 14.8 1 7.1 6.7 4 14.5l7 5.4C12.7 13.6 17.9 9.5 24 9.5z"/>
                <path fill="#34A853" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.9-9.9 6.9-17.4z"/>
                <path fill="#FBBC05" d="M10.9 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.7-4.7l-7-5.4A23.5 23.5 0 0 0 .5 24c0 3.7.9 7.2 2.5 10.3l7.9-5.6z"/>
                <path fill="#EA4335" d="M24 47c5.5 0 10.1-1.8 13.5-4.9l-7.4-5.7c-1.8 1.2-4.2 2-6.1 2-6.1 0-11.3-4.1-13.2-9.7l-7.9 5.6C7.1 41.3 14.8 47 24 47z"/>
              </svg>
            )}
            Lanjutkan dengan Google
          </button>
        </div>

        <p className="text-center text-body-sm text-secondary mt-lg">
          ⚗️ CircuLens — Prototype AI · Demo Mode
        </p>
      </div>
    </div>
  )
}
