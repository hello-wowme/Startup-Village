import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-red-900/30 rounded-full p-5">
            <XCircle className="text-red-400" size={48} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">キャンセルされました</h1>
        <p className="text-gray-400 mb-6">決済がキャンセルされました。課金は行われていません。</p>
        <Link
          href="/profile"
          className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          プロフィールに戻る
        </Link>
      </div>
    </div>
  )
}
