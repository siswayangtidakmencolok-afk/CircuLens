export default function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant flex justify-between items-center w-full px-md md:px-xl py-sm mt-auto z-20 flex-wrap gap-sm">
      <p className="text-label-md font-bold text-on-surface opacity-80 flex items-center gap-2 flex-wrap">
        CircuLens AI Assessment Mode:{' '}
        <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px]">Active</span>
        {' '}|{' '}
        <span className="text-amber-600 font-semibold">⚗️ Prototype AI — Demo Mode</span>
        {' '}|{' '}
        <span className="text-secondary">Local Data: Active</span>
      </p>
      <ul className="flex gap-md text-label-md text-on-surface-variant opacity-80 list-none m-0 p-0">
        <li><a className="hover:underline hover:text-primary transition-colors" href="#">Support</a></li>
        <li><a className="hover:underline hover:text-primary transition-colors" href="#">Documentation</a></li>
        <li><a className="hover:underline hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
      </ul>
    </footer>
  )
}
