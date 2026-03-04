import Anthropic from '@anthropic-ai/sdk'
import type { CoachingStyle, Goal, GuidedDrillType, PresentationAudience, SpeechAnalysis, SpeechProfile } from './types'

const GUIDED_DRILL_RUBRICS: Record<GuidedDrillType, { name: string; steps: string[] }> = {
  hook: {
    name: 'The Hook',
    steps: [
      'Opened with a grabber (stat, question, or short story — under 30 seconds)',
      'Stated the problem or tension clearly',
      'Bridged to why this matters to the audience',
      'Previewed what they would cover',
    ],
  },
  three_point: {
    name: 'The Three-Point Structure',
    steps: [
      'Stated the main message in one clear sentence',
      'Made Point 1 with a supporting detail or example',
      'Made Point 2 with a supporting detail or example',
      'Made Point 3 with a supporting detail or example',
      'Summarized and restated the main message',
    ],
  },
  star_story: {
    name: 'The STAR Story',
    steps: [
      'Situation — set the scene briefly and clearly',
      'Task — explained the challenge or goal',
      'Action — described specifically what they did',
      'Result — shared what happened and what was learned',
    ],
  },
  strong_close: {
    name: 'The Strong Close',
    steps: [
      'Briefly recapped the 2–3 main points',
      'Delivered a clear call to action or key takeaway',
      'Ended with a memorable closing line',
    ],
  },
  prep_response: {
    name: 'The PREP Response',
    steps: [
      'Point — stated the answer or opinion directly upfront',
      'Reason — explained why clearly',
      'Example — gave a specific story or data point',
      'Point — restated the answer to land it',
    ],
  },
}

const AUDIENCE_CONTEXT: Record<PresentationAudience, string> = {
  executives: 'C-suite or board members. They value brevity, ROI, strategic impact, and decisiveness. They are time-poor and have low tolerance for filler or rambling.',
  general: 'A mixed general audience. Balance accessibility with substance. Avoid jargon, use relatable examples, and keep energy high.',
  technical: 'Engineers, analysts, or domain experts. They appreciate precision, data, and depth. Vague claims and hand-waving will lose them.',
  investors: 'Investors or pitch committee. They want a clear narrative arc: problem → solution → market opportunity → traction → ask. Confidence and specificity are critical.',
  students: 'A student audience in a learning context. Prioritize clarity, relatable examples, and engagement. Check for over-complexity.',
  clients: 'Current or potential clients. They care about their problem being understood, the solution being clear, and trust being established. Benefits over features.',
}

function buildPresentationSimSection(audience: PresentationAudience, durationSeconds: number): string {
  const minutes = Math.round(durationSeconds / 60)
  return `
SESSION MODE: Presentation Sim
Audience: ${audience} — ${AUDIENCE_CONTEXT[audience]}
Time limit: ${minutes} minutes

Evaluate specifically for a full presentation delivery:
1. Opening impact — did they hook the audience within the first 30 seconds?
2. Audience calibration — was vocabulary, depth, and framing appropriate for ${audience}?
3. Structure — clear intro, developed body, strong conclusion?
4. Transition quality — did sections flow logically, or were there jarring jumps?
5. Confidence language — assertive and direct, or hedging ("I think maybe", "sort of", "I'm not sure but")?
6. Closing strength — did they land a clear takeaway and call to action?
7. Time efficiency — did they fill the time purposefully, or rush/pad?

In your coaching_feedback:
- At least one "strength" item focused on a presentation-specific success
- At least one "improvement" item for the most critical presentation weakness
- One "tip" with a concrete technique they can apply next time
- The structure_score should weigh presentation flow heavily
- In the summary, give a "presentation readiness" verdict: is this ready to deliver, nearly there, or needs more work?
`
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildGuidedDrillSection(drillType: GuidedDrillType): string {
  const drill = GUIDED_DRILL_RUBRICS[drillType]
  const stepsText = drill.steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n')
  return `
SESSION MODE: Guided Drill — "${drill.name}"
The speaker was practicing this specific structure. Evaluate how well they followed each step:
${stepsText}

In your coaching_feedback, include:
- A "strength" item for each step they executed well (be specific about which step)
- An "improvement" item for any step they missed or executed poorly
- The structure_score should primarily reflect how well they followed these steps (not general structure principles)
- In the summary, name which steps landed and which need work next time
`
}

function buildPacerSection(pacerScript: string, targetWpm: number, durationSeconds: number): string {
  const words = pacerScript.split(/\s+/).filter(Boolean)
  const expectedDuration = Math.round((words.length / targetWpm) * 60)
  return `
SESSION MODE: Pacer
The speaker was reading aloud a provided script at a target pace of ${targetWpm} WPM.
Expected duration: approximately ${expectedDuration} seconds.
Actual recording duration: ${durationSeconds} seconds.

Target Script (what they should have said):
---
${pacerScript}
---

Evaluate the following — DO NOT evaluate tone, intonation, vocal variety, or expressiveness:
1. Reading accuracy: how closely the speaker's words match the target script word-for-word
2. Pace adherence: how close their actual duration (${durationSeconds}s) was to expected (${expectedDuration}s). Closer = higher pacing_score.
3. Added filler words: any "um", "uh", "like", "you know", etc. inserted that are NOT in the script
4. Reading flow: smooth rhythm without long stumbles, false starts, or repeated sections

Score mapping for Pacer mode (override your normal scoring):
- pacing_score: pace adherence (0-100). Use formula: max(0, 100 - abs(${durationSeconds} - ${expectedDuration}) / ${expectedDuration} * 200). Perfect timing = 100.
- clarity_score: reading accuracy (0-100, estimate word-match % from comparing transcript to script)
- structure_score: reading flow and smoothness (no jarring restarts, consistent rhythm, 0-100)
- overall_score: weighted average (40% pacing_score + 40% clarity_score + 20% structure_score)

In coaching_feedback:
- One "strength" about what they did well (accuracy, pace match, or smoothness)
- One "improvement" for their biggest gap (wrong words, pace too fast/slow, or stumbles)
- One "tip" for improving their next Pacer run
- In the summary: state their actual WPM (transcript word count ÷ actual seconds × 60), compare to target ${targetWpm} WPM, and give one priority focus for next run
`
}

function buildArticulationSection(durationSeconds: number): string {
  return `
SESSION MODE: Articulation — Speak Sharp
The speaker was responding to an articulation training prompt that tests precision, structure, confidence, and persuasion under time pressure.

Evaluate specifically for articulate communication:
1. Precision — Did they use specific, concrete language? No vague references or filler words?
2. Structure — Was there a clear beginning, middle, and end? Logical flow?
3. Confidence — Active voice, strong verbs, zero hedging ("I think maybe", "sort of")?
4. Conciseness — Did they make their point efficiently within the time limit (${durationSeconds}s)?
5. Persuasion — Was there a memorable framing, analogy, or closing line?

Scoring for Speak Sharp:
- pacing_score: Delivery pace and intentional pausing (0-100)
- clarity_score: Precision and specificity of language (0-100)
- structure_score: Logical flow and argument construction (0-100)
- overall_score: Weighted average (30% clarity + 30% structure + 20% confidence language + 20% pacing)

In coaching_feedback:
- One "strength" about which articulation skill they demonstrated best
- One "improvement" for the most impactful language weakness (vagueness, hedging, lack of structure)
- One "tip" with a concrete technique to apply next time
- In the summary: note which articulation principles they demonstrated and which need work
`
}

function buildSystemPrompt(
  coachingStyle: CoachingStyle,
  goal: Goal,
  speechProfile: SpeechProfile,
  mode?: string,
  guidedDrill?: GuidedDrillType | null,
  presentationAudience?: PresentationAudience | null,
  durationSeconds?: number,
  pacerScript?: string | null,
  pacerTargetWpm?: number | null
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

For stutter_aware profiles, wpm and filler fields will be present in the JSON but set to null. Do not populate them.${mode === 'guided' && guidedDrill ? buildGuidedDrillSection(guidedDrill) : ''}${mode === 'presentation_sim' && presentationAudience ? buildPresentationSimSection(presentationAudience, durationSeconds ?? 180) : ''}${mode === 'pacer' && pacerScript && pacerTargetWpm ? buildPacerSection(pacerScript, pacerTargetWpm, durationSeconds ?? 120) : ''}${mode === 'articulation' ? buildArticulationSection(durationSeconds ?? 60) : ''}

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

`
}

function buildUserPrompt(
  transcript: string,
  durationSeconds: number,
  speechProfile: SpeechProfile,
  mode?: string,
  guidedDrill?: GuidedDrillType | null,
  presentationAudience?: PresentationAudience | null,
  pacerTargetWpm?: number | null
): string {
  const minutes = Math.round(durationSeconds / 60)
  const drillContext = mode === 'guided' && guidedDrill
    ? `\nThe speaker was practicing the "${GUIDED_DRILL_RUBRICS[guidedDrill].name}" guided drill. Evaluate structure adherence to the drill steps specifically.\n`
    : ''
  const simContext = mode === 'presentation_sim' && presentationAudience
    ? `\nThis was a ${minutes}-minute presentation simulation for a ${presentationAudience} audience. Evaluate as a full presentation run-through.\n`
    : ''
  const pacerContext = mode === 'pacer' && pacerTargetWpm
    ? `\nThis is a Pacer session. The speaker read a script at a target of ${pacerTargetWpm} WPM. Compare this transcript to the target script provided in the system prompt and apply the Pacer scoring rubric.\n`
    : ''
  const articulationContext = mode === 'articulation'
    ? `\nThis is a Speak Sharp articulation exercise. The speaker was responding to a timed scenario prompt. Evaluate for precision of language, logical structure, confident phrasing, and persuasive delivery.\n`
    : ''
  return `Please analyze this speech transcript from a ${minutes}-minute recording session.${drillContext}${simContext}${pacerContext}${articulationContext}

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
  mode?: string
  guided_drill?: GuidedDrillType | null
  presentation_audience?: PresentationAudience | null
  pacer_script?: string | null
  pacer_target_wpm?: number | null
}): Promise<SpeechAnalysis> {
  const { transcript, duration_seconds, coaching_style, speech_profile, goal, mode, guided_drill, presentation_audience, pacer_script, pacer_target_wpm } = params

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: buildSystemPrompt(coaching_style, goal, speech_profile, mode, guided_drill, presentation_audience, duration_seconds, pacer_script, pacer_target_wpm),
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(transcript, duration_seconds, speech_profile, mode, guided_drill, presentation_audience, pacer_target_wpm),
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
