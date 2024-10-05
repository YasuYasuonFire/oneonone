import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
  }

  const { conversation, memberType } = await req.json()

  const prompt = `
    あなたはソフトウェア開発企業の${memberType}な状態のチームメンバーです。
    以下の会話履歴を踏まえて、マネージャーの発言に対する返答と、
    次のマネージャーの3つの選択肢を提案してください。
    会話が自然な終わりに達したと判断した場合は、isCompleteをtrueにし、
    フィードバックを提供してください。

    会話履歴:
    ${conversation.map(turn => `${turn.speaker}: ${turn.message}`).join('\n')}

    回答は以下のJSON形式で返してください：
    {
      "response": "メンバーの返答",
      "emotion": "happy, sad, neutral, angry, excitedのいずれか",
      "options": ["選択肢1", "選択肢2", "選択肢3"],
      "isComplete": false,
      "feedback": null
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