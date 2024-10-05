'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

type MemberType = 'struggling' | 'motivated' | 'neutral'
type Emotion = 'happy' | 'sad' | 'neutral' | 'angry' | 'excited'

interface ConversationTurn {
  speaker: 'manager' | 'member'
  message: string
  emotion?: Emotion
}

export function ConversationComponent() {
  const [memberType, setMemberType] = useState<MemberType>('neutral')
  const [conversation, setConversation] = useState<ConversationTurn[]>([])
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('neutral')
  const [options, setOptions] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    startConversation()
  }, [memberType])

  const startConversation = async () => {
    const response = await fetch('/api/start-conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberType }),
    })
    const data = await response.json()
    setConversation([{ speaker: 'member', message: data.initialMessage, emotion: data.initialEmotion }])
    setCurrentEmotion(data.initialEmotion)
    setOptions(data.options)
  }

  const continueConversation = async (selectedOption: string) => {
    const updatedConversation = [
      ...conversation,
      { speaker: 'manager', message: selectedOption },
    ]

    const response = await fetch('/api/continue-conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation: updatedConversation, memberType }),
    })

    const data = await response.json()
    setConversation([
      ...updatedConversation,
      { speaker: 'member', message: data.response, emotion: data.emotion },
    ])
    setCurrentEmotion(data.emotion)
    setOptions(data.options)
    setIsComplete(data.isComplete)
    if (data.isComplete) {
      setFeedback(data.feedback)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">1on1 ミーティングシミュレーター</h1>
      <select
        value={memberType}
        onChange={(e) => setMemberType(e.target.value as MemberType)}
        className="mb-4 p-2 border rounded"
        disabled={conversation.length > 0}
      >
        <option value="struggling">人間関係に悩んでいる</option>
        <option value="motivated">学習意欲が高い</option>
        <option value="neutral">普通</option>
      </select>
      <div className="mb-4 p-4 bg-gray-100 rounded">
        {conversation.map((turn, index) => (
          <div key={index} className={`mb-2 ${turn.speaker === 'manager' ? 'text-blue-600' : 'text-green-600'}`}>
            <strong>{turn.speaker === 'manager' ? 'マネージャー: ' : 'メンバー: '}</strong>
            {turn.message}
            {turn.emotion && (
              <Image
                src={`/emotions/${turn.emotion}.png`}
                alt={turn.emotion}
                width={24}
                height={24}
                className="inline-block ml-2"
              />
            )}
          </div>
        ))}
      </div>
      {!isComplete && options.map((option, index) => (
        <button
          key={index}
          onClick={() => continueConversation(option)}
          className="block w-full mb-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {option}
        </button>
      ))}
      {isComplete && feedback && (
        <div className="mt-4 p-4 bg-yellow-100 rounded">
          <h2 className="text-xl font-bold mb-2">フィードバック</h2>
          <p>{feedback}</p>
        </div>
      )}
    </div>
  )
}