import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const noto = Noto_Sans_JP({ subsets: ['latin'], weight: ['400', '500', '700', '900'] })

export const metadata: Metadata = {
  title: 'Startup Village - 起業シミュレーションSNS',
  description: '起業アイデアをシェアして仲間から応援コインをもらおう',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${noto.className} bg-white text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
