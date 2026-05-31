import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'punch-log',
  description: '打刻・工数管理システム',
}

const navLinks = [
  { href: '/employee', label: '社員', badge: 'bg-blue-100 text-blue-700', desc: '田中 太郎' },
  { href: '/manager', label: '上司', badge: 'bg-purple-100 text-purple-700', desc: '鈴木 花子' },
  { href: '/projects', label: 'PM', badge: 'bg-green-100 text-green-700', desc: '伊藤 四郎' },
  { href: '/executive', label: '経営', badge: 'bg-orange-100 text-orange-700', desc: '中村 六子' },
  { href: '/admin', label: '管理者', badge: 'bg-gray-100 text-gray-700', desc: '渡辺 五郎' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
            <Link href="/employee" className="font-bold text-blue-600 text-lg tracking-tight shrink-0">
              punch-log
            </Link>
            <div className="w-px h-5 bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium shrink-0">デモ切替:</span>
            <nav className="flex items-center gap-1.5 flex-wrap">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  title={link.desc}
                  className={`text-xs font-semibold px-3 py-1 rounded-full transition-opacity hover:opacity-70 ${link.badge}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="ml-auto text-xs text-gray-500 hidden sm:block">
              2026年5月30日（金）
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
