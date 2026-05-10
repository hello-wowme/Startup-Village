export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-black text-gray-900 mb-8">プライバシーポリシー</h1>
      <div className="prose text-gray-600 space-y-6 text-sm leading-relaxed">
        <p>Startup Village（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。</p>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">1. 収集する情報</h2>
          <p>本サービスでは、X（Twitter）アカウントによる認証時に、アカウント名・表示名・プロフィール画像URLを取得します。</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">2. 情報の利用目的</h2>
          <p>取得した情報は、サービスの提供・改善・ユーザーサポートのためにのみ使用します。第三者への販売・提供は行いません。</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">3. データの保管</h2>
          <p>ユーザー情報はSupabase（米国）のサーバーに暗号化して保管されます。</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">4. Cookieの使用</h2>
          <p>本サービスはセッション管理のためにCookieを使用します。</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">5. アカウントの削除</h2>
          <p>ユーザーはいつでもアカウントの削除を要求できます。削除の際は、関連する個人情報もあわせて削除します。</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">6. お問い合わせ</h2>
          <p>プライバシーに関するご質問は、X（Twitter）の @wowme_surprise までお問い合わせください。</p>
        </section>

        <p className="text-gray-400 text-xs mt-8">最終更新日: 2025年5月10日</p>
      </div>
    </div>
  )
}
