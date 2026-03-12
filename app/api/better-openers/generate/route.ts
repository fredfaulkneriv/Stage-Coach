import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const RELATIONSHIP_LABELS: Record<string, string> = {
  colleague: 'a work colleague I know moderately well',
  new_acquaintance: 'someone I am meeting for the first time',
  client: 'a current or potential client',
  stranger: 'a stranger I have just been introduced to',
}

const SETTING_LABELS: Record<string, string> = {
  work: 'a professional work context',
  social: 'a social gathering or party',
  networking: 'a professional networking event',
  casual: 'a casual, informal setting',
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { relationship_type, setting, shared_context } = body as {
      relationship_type: string
      setting: string
      shared_context?: string
    }

    const relationshipLabel = RELATIONSHIP_LABELS[relationship_type] ?? relationship_type
    const settingLabel = SETTING_LABELS[setting] ?? setting

    const userMessage = [
      `Person I'm talking to: ${relationshipLabel}`,
      `Setting: ${settingLabel}`,
      shared_context?.trim()
        ? `Shared context: ${shared_context.trim()}`
        : null,
    ]
      .filter(Boolean)
      .join('\n')

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 120,
      system:
        'You are a conversation coach helping someone replace generic small talk with specific, curiosity-driven openers. Given the person they are talking to, the setting, and any shared context, generate ONE natural, specific opener that is open-ended, shows genuine interest, and does not put the conversational burden entirely on the other person. Return only the opener, no explanation, no quotation marks.',
      messages: [{ role: 'user', content: userMessage }],
    })

    const opener =
      message.content[0]?.type === 'text' ? message.content[0].text.trim() : null

    if (!opener) {
      return NextResponse.json({ success: false, error: 'No opener generated' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: { opener } })
  } catch (err) {
    console.error('better-openers/generate error:', err)
    return NextResponse.json({ success: false, error: 'Failed to generate opener' }, { status: 500 })
  }
}
