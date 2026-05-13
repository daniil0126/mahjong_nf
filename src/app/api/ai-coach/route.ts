import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { boardSummary } = await req.json()

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: `Ты — AI-тренер по маджонгу. Анализируй состояние доски и давай краткие стратегические советы на русском языке.
Правила маджонга-пасьянса: можно убирать только свободные плитки (не перекрытые сверху и с хотя бы одной свободной стороной).
Отвечай 2-3 короткими конкретными советами. Без вступлений и заключений.`,
      messages: [
        {
          role: 'user',
          content: `Состояние доски:
- Осталось плиток: ${boardSummary.remaining}
- Свободные плитки: ${boardSummary.freeTiles.join(', ')}
- Ходов сделано: ${boardSummary.moves}
- Подсказок использовано: ${boardSummary.hintsUsed}
- Текущий счёт: ${boardSummary.score}

Дай стратегический совет.`,
        },
      ],
    })

    const advice = message.content[0].type === 'text' ? message.content[0].text : 'Анализ недоступен.'
    return NextResponse.json({ advice })
  } catch (err) {
    console.error('AI Coach error:', err)
    return NextResponse.json({ advice: 'Не удалось получить совет. Проверьте подключение.' }, { status: 500 })
  }
}
