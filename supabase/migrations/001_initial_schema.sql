-- =============================================
-- Startup Village - Initial Schema
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- profiles テーブル（auth.usersと1:1対応）
-- =============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  twitter_handle text,
  -- 仮想会社情報
  company_name text,
  company_role text,        -- 代表者名・役職
  company_description text, -- 事業内容
  company_founded_at date,
  -- コイン残高
  coins integer not null default 10000,
  total_coins_received integer not null default 0, -- 受け取った総コイン数（ランキング用）
  -- 課金・バッジ
  has_blue_badge boolean not null default false,
  stripe_customer_id text,
  -- メタ
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- posts テーブル
-- =============================================
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  category text not null default 'その他',
  -- AI評価結果
  ai_score integer,           -- 0-100
  ai_feedback text,
  ai_evaluated_at timestamptz,
  -- 統計
  comments_count integer not null default 0,
  coins_received integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- comments テーブル
-- =============================================
create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- =============================================
-- coin_transactions テーブル
-- =============================================
create table public.coin_transactions (
  id uuid primary key default uuid_generate_v4(),
  from_user_id uuid references public.profiles(id) on delete set null,
  to_user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete set null,
  amount integer not null,
  transaction_type text not null, -- 'send', 'weekly_bonus', 'purchase_bonus', 'purchase'
  note text,
  created_at timestamptz not null default now()
);

-- =============================================
-- stripe_payments テーブル
-- =============================================
create table public.stripe_payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_session_id text unique not null,
  stripe_payment_intent_id text,
  amount integer not null,     -- 円
  coins_granted integer not null default 0,
  payment_type text not null,  -- 'blue_badge', 'coin_purchase'
  status text not null default 'pending', -- 'pending', 'completed', 'failed'
  created_at timestamptz not null default now()
);

-- =============================================
-- weekly_coin_grants テーブル（重複付与防止）
-- =============================================
create table public.weekly_coin_grants (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  week_start date not null,
  granted_at timestamptz not null default now(),
  unique(user_id, week_start)
);

-- =============================================
-- RLS (Row Level Security)
-- =============================================
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.coin_transactions enable row level security;
alter table public.stripe_payments enable row level security;
alter table public.weekly_coin_grants enable row level security;

-- profiles: 全員が閲覧可、本人のみ更新
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- posts: 全員が閲覧可、本人のみ作成・更新・削除
create policy "posts_select_all" on public.posts for select using (true);
create policy "posts_insert_own" on public.posts for insert with check (auth.uid() = user_id);
create policy "posts_update_own" on public.posts for update using (auth.uid() = user_id);
create policy "posts_delete_own" on public.posts for delete using (auth.uid() = user_id);

-- comments: 全員が閲覧可、本人のみ作成・削除
create policy "comments_select_all" on public.comments for select using (true);
create policy "comments_insert_own" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments_delete_own" on public.comments for delete using (auth.uid() = user_id);

-- coin_transactions: 関係者のみ閲覧
create policy "coin_tx_select" on public.coin_transactions for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);
create policy "coin_tx_insert" on public.coin_transactions for insert with check (auth.uid() = from_user_id);

-- stripe_payments: 本人のみ
create policy "payments_select_own" on public.stripe_payments for select using (auth.uid() = user_id);

-- weekly_coin_grants: 本人のみ
create policy "weekly_grants_select_own" on public.weekly_coin_grants for select using (auth.uid() = user_id);

-- =============================================
-- Functions & Triggers
-- =============================================

-- 新規ユーザー登録時にprofileを自動作成
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url, twitter_handle)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'preferred_username', new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'user_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- コメント数カウント更新
create or replace function public.update_post_comments_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set comments_count = comments_count + 1 where id = new.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set comments_count = comments_count - 1 where id = old.post_id;
  end if;
  return null;
end;
$$;

create trigger on_comment_change
  after insert or delete on public.comments
  for each row execute procedure public.update_post_comments_count();

-- updated_at自動更新
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger posts_updated_at before update on public.posts
  for each row execute procedure public.set_updated_at();

-- =============================================
-- Indexes
-- =============================================
create index idx_posts_user_id on public.posts(user_id);
create index idx_posts_created_at on public.posts(created_at desc);
create index idx_comments_post_id on public.comments(post_id);
create index idx_coin_tx_to_user on public.coin_transactions(to_user_id);
create index idx_profiles_coins_received on public.profiles(total_coins_received desc);
