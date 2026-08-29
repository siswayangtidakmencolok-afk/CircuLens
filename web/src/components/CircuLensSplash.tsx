/**
 * CircuLensSplash — cinematic entry animation
 *
 * Sequence (total ~3.2s):
 *   0.0s  background image + dark-green overlay visible
 *   0.3s  logo icon rises (translateY + opacity)
 *   0.7s  "CircuLens" wordmark fades in
 *   1.0s  subtitle fades in
 *   1.4s  tagline fades in
 *   2.0s  breathing room
 *   2.3s  content fades out
 *   2.8s  entire splash layer slides down off viewport (translateY 100%)
 *   3.2s  onComplete() called → Role Selection visible behind it
 *
 * prefers-reduced-motion: skip directly to onComplete after 0 ms
 * No external animation library.
 */

import { useEffect, useState } from 'react'

interface Props {
  onComplete: () => void
}

type Phase =
  | 'entering'   // content animating in
  | 'holding'    // brief breathing room
  | 'exiting'    // content fades out, layer slides down

const DURATIONS = {
  hold:     600,  // ms after content fully in before exit starts
  fadeOut:  500,  // content fades out
  slideOut: 700,  // layer slides down
} as const

const TOTAL = 3200 // ms until onComplete

export default function CircuLensSplash({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('entering')

  useEffect(() => {
    // Respect reduced motion — skip entirely
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete()
      return
    }

    // Sequence
    const t1 = setTimeout(() => setPhase('holding'),  1600) // content fully in
    const t2 = setTimeout(() => setPhase('exiting'),  1600 + DURATIONS.hold)
    const t3 = setTimeout(() => onComplete(), TOTAL)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  const contentVisible = phase === 'entering' || phase === 'holding'
  const layerExiting   = phase === 'exiting'

  return (
    <>
      <style>{`
        /* Logo icon: rises from below */
        @keyframes cl-rise {
          from { opacity: 0; transform: translateY(40px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        /* Text elements: gentle fade + float up */
        @keyframes cl-float-in {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        /* Content layer fades out */
        @keyframes cl-fade-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        /* Entire splash slides down off screen */
        @keyframes cl-slide-down {
          from { transform: translateY(0); }
          to   { transform: translateY(100%); }
        }
        /* Ken-burns subtle zoom on bg */
        @keyframes cl-ken {
          from { transform: scale(1.0); }
          to   { transform: scale(1.10); }
        }
        /* Loading dots pulse */
        @keyframes cl-dot {
          0%, 100% { opacity: 0.25; transform: scale(0.75); }
          50%       { opacity: 1;   transform: scale(1);    }
        }
      `}</style>

      {/* ── Outer layer — slides down on exit ── */}
      <div
        role="status"
        aria-label="Loading CircuLens"
        style={{
          position:  'fixed',
          inset:     0,
          zIndex:    9999,
          overflow:  'hidden',
          /* Slide down when exiting */
          animation: layerExiting
            ? `cl-slide-down ${DURATIONS.slideOut}ms cubic-bezier(0.77,0,0.175,1) forwards`
            : 'none',
        }}
      >
        {/* ── Background: dark-green + farm image ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#003D1F',
          }}
        >
          {/* Farm image with ken-burns */}
          <div
            style={{
              position:           'absolute',
              inset:              0,
              backgroundImage:    `url(https://lh3.googleusercontent.com/aida/AEtjO1U4yXfmfjDi2NMKyteiA1r-AoMpnuzeX82av9C74x8n_6iVX0_yiTrLRZ5lwiXjt-xrrCqR0gx1Qw1l8vAAKaP3UXPHfO8Wj0_3vfetvPgIIkhsqbtquCtKVXLUcTH50NVrdAbpFbhjEjvh8Cgh5UGPfSIoTIa6om7ahBMzmWGDjE9MASLnwiVA02t7qRlNnscTEBMSqHNVi0PweBqQOH6ml7W8Xn7QQCy1NWD3ijBQes5yOrb_n8wljFg)`,
              backgroundSize:     'cover',
              backgroundPosition: 'center',
              opacity:            0.22,
              animation:          'cl-ken 12s ease-out forwards',
            }}
          />
          {/* Vignette */}
          <div
            style={{
              position:   'absolute',
              inset:      0,
              background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,25,10,0.75) 100%)',
            }}
          />
        </div>

        {/* ── Content layer — fades out before slide ── */}
        <div
          style={{
            position:   'relative',
            zIndex:     10,
            height:     '100dvh',
            display:    'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign:  'center',
            padding:    '0 24px',
            /* Fade out the content while layer is still on screen */
            animation: (phase === 'exiting')
              ? `cl-fade-out ${DURATIONS.fadeOut}ms ease-in forwards`
              : 'none',
            opacity: contentVisible ? undefined : 0,
          }}
        >
          {/* Logo icon — rises first */}
          <div
            style={{
              marginBottom: '20px',
              animation: 'cl-rise 0.85s cubic-bezier(0.22,1,0.36,1) 0.3s both',
            }}
          >
            {/* Rounded-square icon matching reference image */}
            <svg
              width="96"
              height="96"
              viewBox="0 0 96 96"
              fill="none"
              aria-hidden="true"
            >
              <rect width="96" height="96" rx="22" fill="white" fillOpacity="0.14" />
              {/* Outer arc */}
              <circle cx="48" cy="47" r="26" stroke="#4ADE80" strokeWidth="5.5" fill="none" />
              {/* Inner ring */}
              <circle cx="48" cy="47" r="13" stroke="#4ADE80" strokeWidth="3" fill="none" fillOpacity="0.2" />
              {/* Center dot */}
              <circle cx="48" cy="47" r="5" fill="#4ADE80" />
              {/* Leaf top-right */}
              <path
                d="M60 32 C68 25 78 28 75 37 C70 30 63 32 60 32Z"
                fill="#4ADE80"
              />
              <line
                x1="60" y1="32" x2="69" y2="40"
                stroke="#4ADE80" strokeWidth="2" strokeLinecap="round"
              />
            </svg>
          </div>

          {/* "CircuLens" wordmark */}
          <h1
            style={{
              fontFamily:   'Inter, system-ui, sans-serif',
              fontSize:     'clamp(40px, 7vw, 64px)',
              fontWeight:   800,
              letterSpacing: '-0.03em',
              color:        '#ffffff',
              lineHeight:   1.05,
              marginBottom: '10px',
              animation:    'cl-float-in 0.85s cubic-bezier(0.22,1,0.36,1) 0.7s both',
            }}
          >
            CircuLens
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily:   'Inter, system-ui, sans-serif',
              fontSize:     'clamp(10px, 1.6vw, 12px)',
              fontWeight:   700,
              letterSpacing: '0.20em',
              textTransform: 'uppercase',
              color:        'rgba(255,255,255,0.5)',
              marginBottom: '22px',
              animation:    'cl-float-in 0.8s cubic-bezier(0.22,1,0.36,1) 1.0s both',
            }}
          >
            Circular Food Intelligence Platform
          </p>

          {/* Tagline */}
          <p
            style={{
              fontFamily:   'Inter, system-ui, sans-serif',
              fontSize:     'clamp(15px, 2.2vw, 19px)',
              fontWeight:   500,
              color:        'rgba(255,255,255,0.70)',
              letterSpacing: '-0.01em',
              animation:    'cl-float-in 0.9s cubic-bezier(0.22,1,0.36,1) 1.4s both',
            }}
          >
            From harvest to smarter decisions.
          </p>
        </div>

        {/* ── Loading dots — bottom ── */}
        <div
          style={{
            position:  'absolute',
            bottom:    '44px',
            left:      '50%',
            transform: 'translateX(-50%)',
            display:   'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap:        '8px',
            animation: (phase === 'exiting')
              ? `cl-fade-out ${DURATIONS.fadeOut}ms ease-in forwards`
              : 'cl-float-in 0.6s ease 1.6s both',
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            {[0, 0.22, 0.44].map((delay, i) => (
              <div
                key={i}
                style={{
                  width:       '7px',
                  height:      '7px',
                  borderRadius: '50%',
                  background:   '#4ADE80',
                  animation:    `cl-dot 1.4s ease-in-out ${delay}s infinite`,
                }}
              />
            ))}
          </div>
          <p
            style={{
              fontFamily:   'Inter, system-ui, sans-serif',
              fontSize:     '10px',
              fontWeight:   700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color:        'rgba(255,255,255,0.35)',
            }}
          >
            Menyiapkan sistem...
          </p>
        </div>
      </div>
    </>
  )
}
