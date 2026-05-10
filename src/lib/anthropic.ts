import Anthropic from '@anthropic-ai/sdk'

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

export async function evaluateBusiness(title: string, content: string): Promise<{ score: number; feedback: string }> {
  const client = getClient()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `あなたはスタートアップの事業評価の専門家です。以下の起業アイデアを評価してください。

事業タイトル: ${title}
事業内容: ${content}

以下の観点で0〜100点で評価し、フィードバックをJSON形式で返してください：
- 市場規模・ニーズ（25点）
- 独自性・差別化（25点）
- 実現可能性（25点）
- 収益モデル（25点）

返答は必ず以下のJSON形式のみで返してください（説明文不要）：
{"score": 75, "feedback": "フィードバック本文（300文字程度）"}`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON not found')
    const parsed = JSON.parse(jsonMatch[0])
    return {
      score: Math.min(100, Math.max(0, parseInt(parsed.score) || 50)),
      feedback: parsed.feedback || 'フィードバックを取得できませんでした。',
    }
  } catch {
    return { score: 50, feedback: 'フィードバックを取得できませんでした。' }
  }
}
