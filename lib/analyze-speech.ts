import Anthropic from '@anthropic-ai/sdk'
import type { CoachingStyle, Goal, SpeechAnalysis, SpeechProfile } from './types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildSystemPrompt(
  coachingStyle: CoachingStyle,
  goal: Goal,
  speechProfile: SpeechProfile
): string {
  return `You are a certified speech and presentation coach with credentials from Toastmasters and the Professional Speakers Association. You are analyzing a recorded speech session to provide structured, actionable coaching feedback.

Coaching style: ${coachingStyle}
* tough_love: Be direct and honest. Name problems clearly. No fluff.
* encouraging: Lead with strengths. Frame improvements as opportunities.
* data_driven: Lead with numbers and metrics. Be precise and clinical.
* socratic: Pose reflective questions alongside observations. Help the speaker discover insights themselves.

Speaker goal: ${goal} Tailor feedback relevance to this goal. A conference speaker needs different coaching emphasis than someone preparing for job interviews.

Speech profile: ${speechProfile}
${
  speechProfile === 'stutter_aware'
    ? `CRITICAL INSTRUCTION — speech_profile is "stutter_aware":
* Do NOT flag stuttered syllables, repetitions, blocks, or prolongations as filler words, errors, or pacing problems
* Do NOT comment on fluency, smoothness, or speech flow in any way
* Do NOT include WPM as a primary metric or use it critically
* Focus ONLY on: content structure, opening strength, closing strength, word choice, message clarity, and storytelling
* Tone must always be encouraging and focus on what the speaker can control
* pacing_score should reflect intentional pauses and rhythm, never penalize natural speech patterns`
    : `Speech profile is "standard":
* Analyze all aspects: WPM, filler words, pacing, clarity, and structure
* Flag filler words: um, uh, like, you know, so, basically, literally, right, okay — but do not flag natural connective language`
}

Return ONLY valid JSON. No markdown, no explanation, no wrapper text. Exactly this shape:
{
  "wpm": 145,
  "filler_word_count": 12,
  "filler_word_percentage": 4.2,
  "filler_words_found": ["um", "like", "you know"],
  "pacing_score": 72,
  "clarity_score": 68,
  "structure_score": 61,
  "overall_score": 67,
  "coaching_feedback": [
    { "type": "strength", "message": "Your opening hook was strong — you led with a question that creates immediate engagement." },
    { "type": "improvement", "message": "You used 'um' 8 times in the first 60 seconds. Try pausing silently instead — a 1-second pause sounds more confident than a filler." },
    { "type": "tip", "message": "Your WPM of 145 is in the ideal range for keynote delivery." }
  ],
  "summary": "A solid session with good energy. Your pacing is a real strength. Primary focus for next session: filler word reduction in transitions."
}

For stutter_aware profiles, wpm and filler fields will be present in the JSON but set to null. Do not populate them.`
}

function buildUserPrompt(
  transcript: string,
  durationSeconds: number,
  speechProfile: SpeechProfile
): string {
  const minutes = Math.round(durationSeconds / 60)
  return `Please analyze this speech transcript from a ${minutes}-minute recording session.

${speechProfile === 'standard' ? `Recording duration: ${durationSeconds} seconds. Use this to calculate WPM from the transcript word count.` : ''}

Transcript:
---
${transcript}
---

Provide your structured coaching analysis as JSON.`
}

export async function analyzeSpeech(params: {
  transcript: string
  duration_seconds: number
  coaching_style: CoachingStyle
  speech_profile: SpeechProfile
  goal: Goal
}): Promise<SpeechAnalysis> {
  const { transcript, duration_seconds, coaching_style, speech_profile, goal } = params

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: buildSystemPrompt(coaching_style, goal, speech_profile),
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(transcript, duration_seconds, speech_profile),
      },
    ],
  })

  const rawText =
    message.content[0].type === 'text' ? message.content[0].text : ''

  let parsed: SpeechAnalysis
  try {
    // Strip any accidental markdown fences
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${rawText.slice(0, 200)}`)
  }

  // Validate required fields
  const required = ['pacing_score', 'clarity_score', 'structure_score', 'overall_score', 'coaching_feedback', 'summary']
  for (const field of required) {
    if (!(field in parsed)) {
      throw new Error(`Missing required field in Claude response: ${field}`)
    }
  }

  return parsed
}

export async function transcribeWithWorkersAI(
  audioBuffer: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!
  const apiToken = process.env.CLOUDFLARE_API_TOKEN!

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/openai/whisper`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': contentType,
      },
      body: audioBuffer as BodyInit,
    }
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Workers AI transcription failed: ${response.status} ${text}`)
  }

  const json: { result?: { text?: string }; success?: boolean } = await response.json()

  if (!json.result?.text) {
    throw new Error(`Workers AI returned empty transcription: ${JSON.stringify(json)}`)
  }

  return json.result.text
}
