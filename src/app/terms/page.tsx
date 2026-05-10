export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-black text-gray-900 mb-8">利用規約</h1>
      <div className="prose text-gray-600 space-y-6 text-sm leading-relaxed">
        <p>Startup Village（以下「本サービス」）をご利用いただく前に、以下の利用規約をお読みください。</p>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">1. サービスの概要</h2>
          <p>本サービスは、起業アイデアをシェアし、仲間から応援コイン（アプリ内仮想通貨）を受け取れる起業シミュレーションSNSです。コインは現金化できません。</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">2. 禁止事項</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>他者への誹謗中傷・ハラスメント</li>
            <li>虚偽の情報の投稿</li>
            <li>スパム・宣伝目的の投稿</li>
            <li>システムへの不正アクセス</li>
            <li>法令に違反する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">3. 知的財産権</h2>
          <p>ユーザーが投稿したコンテンツの著作権はユーザー本人に帰属します。ただし、本サービスはサービス改善のためにコンテンツを利用する権利を有します。</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">4. 免責事項</h2>
          <p>本サービスはシミュレーション目的であり、投資・事業の成功を保証するものではありません。サービスの中断・終了により生じた損害について責任を負いません。</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">5. アカウント停止</h2>
          <p>禁止事項に違反したユーザーのアカウントを予告なく停止・削除する場合があります。</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">6. 規約の変更</h2>
          <p>本規約は予告なく変更する場合があります。変更後もサービスを利用した場合、変更に同意したものとみなします。</p>
        </section>

        <p className="text-gray-400 text-xs mt-8">最終更新日: 2025年5月10日</p>
      </div>
    </div>
  )
}
