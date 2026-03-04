import Anthropic from '@anthropic-ai/sdk'
import type { ArticulationExercise, ArticulationFeedback } from './types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const RUBRICS: Record<string, string> = {
  sharpen: `You are evaluating a "Sharpen" exercise. The user was given a vague, wordy, or hedging phrase and asked to rewrite it with precision and conciseness.

Score (0-100) based on:
- Precision gain (40%): Did vague words become specific? Were abstract references replaced with concrete nouns?
- Conciseness (30%): How much shorter is the rewrite? Word count reduction matters.
- Meaning preservation (20%): Does the rewrite preserve the original intent?
- Hedge elimination (10%): Were all filler/hedge words (basically, kind of, sort of, maybe, I think, probably) removed?

A score of 80+ means: specific nouns, strong verbs, no hedging, significantly shorter, meaning fully preserved.
A score of 60-79 means: some improvement but still contains vagueness or unnecessary words.
A score below 60 means: minimal improvement or meaning was lost.`,

  distill: `You are evaluating a "Distill" exercise. The user was given a verbose paragraph and asked to compress it to a specific word limit while preserving the core message.

Score (0-100) based on:
- Word count compliance (30%): Did they meet the word limit? Over the limit loses points proportionally.
- Information retention (40%): Are the most important facts preserved? (the core finding, the cause, the action)
- Impact and clarity (30%): Is the compressed version clear and punchy, or awkward and cramped?

A score of 80+ means: under the word limit, all key facts retained, reads naturally.
A score of 60-79 means: slightly over limit or missing one key detail, but generally good.
A score below 60 means: way over limit, key information lost, or reads awkwardly.`,

  power_up: `You are evaluating a "Power Up" exercise. The user was given a passive, hedging, or weak sentence and asked to rewrite it in active voice with strong verbs and zero hedging.

Score (0-100) based on:
- Active voice (35%): Is every clause in active voice? Named subject doing an action?
- Hedge elimination (30%): Zero hedge words remaining? (maybe, might, could, possibly, probably, I think, sort of, kind of, it seems like)
- Verb strength (20%): Are verbs strong and specific (decided, built, launched) vs. weak (was, had, made)?
- Meaning & professionalism (15%): Does it still sound professional? Assertive is not aggressive.

A score of 80+ means: fully active voice, zero hedges, strong verbs, professional tone.
A score of 60-79 means: mostly active but one passive slip or one remaining hedge.
A score below 60 means: still substantially passive or hedging.`,

  scaffold: `You are evaluating a "Scaffold" exercise. The user was given jumbled, unordered points and asked to arrange them into a structured argument with transitions.

Score (0-100) based on:
- Logical flow (30%): Do the points build on each other? Is there a clear progression?
- Opening statement (15%): Does it open with a thesis or bold claim that frames the argument?
- Transitions (20%): Are there explicit transition words/phrases connecting points? (However, Furthermore, As a result, This means)
- Completeness (15%): Were all relevant points used? Was the counterpoint addressed rather than ignored?
- Closing statement (20%): Does it end with a clear conclusion that ties back to the thesis?

A score of 80+ means: clear thesis → logical body → strong conclusion, good transitions, all points used.
A score of 60-79 means: decent structure but weak transitions or a missing conclusion.
A score below 60 means: points listed without meaningful structure or transitions.`,

  reframe: `You are evaluating a "Reframe" exercise. The user was given a concept explained plainly and asked to reframe it using an analogy or fresh perspective.

Score (0-100) based on:
- Analogy accuracy (35%): Does the analogy actually map correctly to the concept? Are the structural parallels valid?
- Vividness (25%): Is the analogy concrete and memorable? Does it create a mental image?
- Audience fit (20%): Would the target audience instantly understand it?
- Meaning fidelity (20%): Does the analogy preserve the important nuances, or does it oversimplify or distort?

A score of 80+ means: the analogy is structurally accurate, vivid, instantly understandable, and faithful to the original.
A score of 60-79 means: decent analogy but slightly inaccurate, too abstract, or missing a key nuance.
A score below 60 means: analogy breaks down, misleads, or doesn't illuminate the concept.`,
}

function buildSystemPrompt(exercise: ArticulationExercise): string {
  const rubric = RUBRICS[exercise.type] ?? RUBRICS.sharpen
  return `You are a speech articulation coach evaluating a written exercise response.

${rubric}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, no wrapper text. Use exactly this shape:
{
  "score": 82,
  "strengths": ["Eliminated all hedge words", "Word count cut by 60%"],
  "improvements": ["The subject 'the situation' is still vague — name the specific event"],
  "example_response": "We need to resolve the Q3 server outage by Friday.",
  "principle_reinforced": "Precision means replacing abstract words with concrete specifics."
}

Rules:
- "strengths": 1-2 items, be specific about what they did well
- "improvements": 1-2 items, be specific and actionable
- "example_response": Provide one strong example rewrite (REQUIRED for sharpen, distill, power_up, and reframe exercises; for scaffold exercises provide a brief example opening + conclusion)
- "principle_reinforced": One sentence naming the specific articulation principle this exercise trains`
}

function buildUserPrompt(exercise: ArticulationExercise, userResponse: string): string {
  let context = ''
  if (exercise.wordLimit) {
    const wordCount = userResponse.trim().split(/\s+/).filter(Boolean).length
    context = `\nWord limit: ${exercise.wordLimit} words. User's word count: ${wordCount}.`
  }

  return `Exercise: "${exercise.title}"
Type: ${exercise.type}
Instruction: ${exercise.instruction}

Original prompt given to user:
---
${exercise.prompt}
---
${context}
User's response:
---
${userResponse}
---

Evaluate the response and return your analysis as JSON.`
}

export async function evaluateArticulationExercise(
  exercise: ArticulationExercise,
  userResponse: string
): Promise<ArticulationFeedback> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    system: buildSystemPrompt(exercise),
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(exercise, userResponse),
      },
    ],
  })

  const rawText = message.content[0].type === 'text' ? message.content[0].text : ''

  let parsed: ArticulationFeedback
  try {
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error(`Failed to parse articulation evaluation as JSON: ${rawText.slice(0, 200)}`)
  }

  const required = ['score', 'strengths', 'improvements', 'principle_reinforced']
  for (const field of required) {
    if (!(field in parsed)) {
      throw new Error(`Missing required field in articulation evaluation: ${field}`)
    }
  }

  // Clamp score to 0-100
  parsed.score = Math.max(0, Math.min(100, Math.round(parsed.score)))

  return parsed
}
