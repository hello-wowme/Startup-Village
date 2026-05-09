export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          twitter_handle: string | null
          company_name: string | null
          company_role: string | null
          company_description: string | null
          company_founded_at: string | null
          coins: number
          total_coins_received: number
          has_blue_badge: boolean
          stripe_customer_id: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          category: string
          ai_score: number | null
          ai_feedback: string | null
          ai_evaluated_at: string | null
          comments_count: number
          coins_received: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'comments_count' | 'coins_received' | 'ai_score' | 'ai_feedback' | 'ai_evaluated_at' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['posts']['Insert']>
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['comments']['Insert']>
      }
      coin_transactions: {
        Row: {
          id: string
          from_user_id: string | null
          to_user_id: string
          post_id: string | null
          amount: number
          transaction_type: string
          note: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['coin_transactions']['Row'], 'id' | 'created_at'>
        Update: never
      }
      stripe_payments: {
        Row: {
          id: string
          user_id: string
          stripe_session_id: string
          stripe_payment_intent_id: string | null
          amount: number
          coins_granted: number
          payment_type: string
          status: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['stripe_payments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['stripe_payments']['Insert']>
      }
      weekly_coin_grants: {
        Row: {
          id: string
          user_id: string
          week_start: string
          granted_at: string
        }
        Insert: Omit<Database['public']['Tables']['weekly_coin_grants']['Row'], 'id' | 'granted_at'>
        Update: never
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type CoinTransaction = Database['public']['Tables']['coin_transactions']['Row']

export type PostWithProfile = Post & {
  profiles: Profile
}

export type CommentWithProfile = Comment & {
  profiles: Profile
}

export const POST_CATEGORIES = [
  'IT・テクノロジー',
  'フード・飲食',
  'ヘルスケア',
  'エンタメ',
  '教育',
  'FinTech',
  'EC・小売',
  'サービス業',
  'ものづくり',
  'その他',
] as const
