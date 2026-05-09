import Link from 'next/link'
import { CheckCircle, BadgeCheck, Coins } from 'lucide-react'
import { BLUE_BADGE_COINS_BONUS } from '@/lib/stripe'

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center bg-green-100">
            <CheckCircle className="text-green-500" size={40} />
          </div>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">ありがとうございます！</h1>
        <p className="text-gray-500 mb-6">ブルーバッジの取得が完了しました 🎉</p>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 space-y-3 text-left shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#EEF0FF' }}>
              <BadgeCheck style={{ color: '#5148E5' }} size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">ブルーバッジ取得完了</p>
              <p className="text-gray-400 text-xs">プロフィールに表示されます</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50">
              <Coins className="text-amber-500" size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{BLUE_BADGE_COINS_BONUS.toLocaleString()}応援コイン付与</p>
              <p className="text-gray-400 text-xs">コイン残高に追加されました</p>
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="block w-full text-white font-bold py-3.5 rounded-2xl transition-all hover:opacity-90"
          style={{ background: '#5148E5' }}
        >
          タイムラインへ戻る
        </Link>
      </div>
    </div>
  )
}
