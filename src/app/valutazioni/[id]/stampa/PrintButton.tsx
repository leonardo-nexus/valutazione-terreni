'use client'

import { useEffect } from 'react'

export default function PrintButton({ auto, label }: { auto?: boolean; label: string }) {
  useEffect(() => {
    if (auto) {
      const t = setTimeout(() => window.print(), 500)
      return () => clearTimeout(t)
    }
  }, [auto])

  return (
    <button onClick={() => window.print()} className="no-print gold-btn px-4 py-2 text-sm">
      {label}
    </button>
  )
}
