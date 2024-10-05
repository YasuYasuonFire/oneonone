'use client'

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
    You are simulating a 1-on-1 meeting between a manager and a ${memberType} team member in a software development company. 
    Given the following conversation, continue it by responding as the team member. 
    If the conversation seems to have reached a natural conclusion, instead provide feedback on the manager's performance.
    
    Conversation:
    ${conversation.join('\n')}
    
    ${conversation.length < 6 ? "Team member's response:" : "Feedback on the manager's performance:"}
  `

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  })

  const response = completion.choices[0].message.content

  return NextResponse.json({
    response,
    isComplete: conversation.length >= 6,
    feedback: conversation.length >= 6 ? response : null
  })
}