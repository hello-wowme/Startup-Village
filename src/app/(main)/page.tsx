import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/PostCard'
import { NewPostButton } from '@/components/NewPostButton'
import type { PostWithProfile } from '@/types/database'
import { POST_CATEGORIES } from '@/types/database'

export const revalidate = 60

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const supabase = await createClient()
  const { category } = await searchParams

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('posts')
    .select('*, profiles(*)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (category) query = query.eq('category', category)

  const { data: posts } = await query

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">タイムライン</h1>
        <p className="text-sm text-gray-400 mt-1">みんなの起業アイデアをチェックしよう</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-5">
        <a
          href="/"
          className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all"
          style={!category ? { background: '#5148E5', color: '#fff' } : { background: '#fff', color: '#6B7280', border: '1px solid #E5E7EB' }}
        >
          すべて
        </a>
        {POST_CATEGORIES.map((cat) => (
          <a
            key={cat}
            href={`/?category=${encodeURIComponent(cat)}`}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={category === cat
              ? { background: '#5148E5', color: '#fff' }
              : { background: '#fff', color: '#6B7280', border: '1px solid #E5E7EB' }}
          >
            {cat}
          </a>
        ))}
      </div>

      <NewPostButton />

      <div className="space-y-4">
        {(posts as PostWithProfile[])?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {(!posts || posts.length === 0) && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-4">💡</div>
            <p className="text-gray-500 font-medium mb-1">まだ投稿がありません</p>
            <p className="text-sm text-gray-400">最初の起業アイデアを投稿してみましょう！</p>
          </div>
        )}
      </div>
    </div>
  )
}
