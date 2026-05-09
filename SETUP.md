# Startup Village セットアップガイド

## 1. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、各値を入力してください。

```bash
cp .env.local.example .env.local
```

## 2. Supabase のセットアップ

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. **Authentication → Providers → Twitter (X)** を有効化
   - Twitter Developer Portal でアプリを作成し、Client ID / Secret を設定
   - Callback URL: `https://your-project.supabase.co/auth/v1/callback`
3. **SQL Editor** で `supabase/migrations/001_initial_schema.sql` を実行
4. Settings → API からURL・AnonKey・Service Role Keyをコピー

## 3. Stripe のセットアップ

1. [Stripe](https://stripe.com) でアカウントを作成
2. ダッシュボードから公開キー・シークレットキーをコピー
3. Webhook エンドポイントを作成:
   - URL: `https://your-domain.com/api/stripe/webhook`
   - イベント: `checkout.session.completed`
4. Webhook シークレットをコピー

### ローカル開発時のWebhook テスト

```bash
# Stripe CLI をインストール
brew install stripe/stripe-cli/stripe

# ローカルにWebhookを転送
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 4. Anthropic API のセットアップ

1. [Anthropic Console](https://console.anthropic.com) でAPIキーを作成
2. `.env.local` の `ANTHROPIC_API_KEY` に設定

## 5. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 にアクセス

## 6. 管理者ユーザーの設定

ログイン後、Supabase SQL Editor で以下を実行:

```sql
UPDATE profiles SET is_admin = true WHERE username = 'あなたのTwitterユーザー名';
```

## 機能概要

| 機能 | 説明 |
|------|------|
| Twitterログイン | Supabase Auth経由 |
| 起業アイデア投稿 | タイトル・内容・カテゴリ |
| AI事業評価 | Claude API（claude-opus-4-7）で0-100点評価 |
| 応援コイン送付 | 他ユーザーの投稿にコインを送る |
| 週次ボーナス | プロフィールページから10,000コイン受取 |
| ブルーバッジ | Stripe決済（¥980）で取得 + 50,000コイン付与 |
| ランキング | 応援コイン獲得数ランキング |
| 管理画面 | ユーザー・投稿・決済の管理 |

## ⚠️ 重要事項

- 応援コインは**現金化できません**
- 実際の**投資・出資・金融商品ではありません**
- シミュレーション用のポイントです
