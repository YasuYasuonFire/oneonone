import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
  }

  const { memberType } = await req.json()

  const prompt = `
    あなたはソフトウェア開発企業の${memberType}な状態のチームメンバーです。
    マネージャーとの1on1ミーティングを始めようとしています。
    最初の挨拶と、現在の状態を簡潔に説明してください。
    また、マネージャーの最初の3つの選択肢も提案してください。
    回答は以下のJSON形式で返してください：
    {
      "initialMessage": "メンバーの最初の発言",
      "initialEmotion": "happy, sad, neutral, angry, excitedのいずれか",
      "options": ["選択肢1", "選択肢2", "選択肢3"]
    }
  `

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  })

  const response = JSON.parse(completion.choices[0].message.content || '{}')

  return NextResponse.json(response)
}