import { ArticulationExercise, ArticulationExerciseType, ArticulationTier } from './types'

// Tier metadata

export const TIER_INFO: Record<
  ArticulationTier,
  { name: string; theme: string; description: string; emoji: string; unlockRequirement: number }
> = {
  1: {
    name: 'Precision',
    theme: 'Say exactly what you mean',
    description:
      'Eliminate vague language and hedge words. Learn to express ideas with surgical accuracy.',
    emoji: '🎯',
    unlockRequirement: 0,
  },
  2: {
    name: 'Structure',
    theme: 'Organize ideas before speaking',
    description:
      'Build logical arguments, sequence thoughts clearly, and compress verbose content into impact.',
    emoji: '🧱',
    unlockRequirement: 5,
  },
  3: {
    name: 'Confidence',
    theme: 'Speak with authority',
    description:
      'Convert passive, hedging language into assertive, active-voice statements that command attention.',
    emoji: '⚡',
    unlockRequirement: 5,
  },
  4: {
    name: 'Persuasion',
    theme: 'Make your point land',
    description:
      'Use analogies, reframing, and rhetorical techniques to make complex ideas memorable.',
    emoji: '🔥',
    unlockRequirement: 5,
  },
  5: {
    name: 'Mastery',
    theme: 'Combine all skills under pressure',
    description:
      'Apply precision, structure, confidence, and persuasion simultaneously in timed challenges.',
    emoji: '👑',
    unlockRequirement: 5,
  },
}

// Exercise type metadata

export const EXERCISE_TYPE_INFO: Record<
  ArticulationExerciseType,
  { name: string; description: string; emoji: string; isSpoken: boolean }
> = {
  sharpen: {
    name: 'Sharpen',
    description: 'Rewrite vague phrases into precise, concise statements',
    emoji: '✏️',
    isSpoken: false,
  },
  distill: {
    name: 'Distill',
    description: 'Compress verbose content to its essence under a word limit',
    emoji: '🧪',
    isSpoken: false,
  },
  power_up: {
    name: 'Power Up',
    description: 'Convert passive, hedging language into assertive active voice',
    emoji: '💪',
    isSpoken: false,
  },
  scaffold: {
    name: 'Scaffold',
    description: 'Arrange jumbled ideas into a structured, logical argument',
    emoji: '📐',
    isSpoken: false,
  },
  reframe: {
    name: 'Reframe',
    description: 'Explain a concept with an analogy or fresh perspective',
    emoji: '🔄',
    isSpoken: false,
  },
  speak_sharp: {
    name: 'Speak Sharp',
    description: 'Respond to a scenario prompt with a recorded spoken answer',
    emoji: '🎤',
    isSpoken: true,
  },
}

// ─── TIER 1: PRECISION ───

const TIER_1_EXERCISES: ArticulationExercise[] = [
  // Sharpen exercises
  {
    id: 'sharpen_101',
    type: 'sharpen',
    tier: 1,
    difficultyLevel: 1,
    title: 'Cut the Fluff',
    instruction: 'Rewrite this sentence to be precise and direct. Remove all hedge words and vagueness.',
    prompt:
      'We need to basically figure out a way to kind of deal with the situation that happened last week with the servers.',
    hints: ['What specific situation? Name it.', 'Remove "basically," "kind of," and "a way to."'],
  },
  {
    id: 'sharpen_102',
    type: 'sharpen',
    tier: 1,
    difficultyLevel: 1,
    title: 'Say What You Mean',
    instruction: 'Rewrite to eliminate unnecessary words while keeping the full meaning.',
    prompt:
      'I think it would maybe be a good idea if we sort of looked into the possibility of expanding our team in the near future.',
    hints: ['What is the actual recommendation?', '"I think maybe" weakens your point — own it.'],
  },
  {
    id: 'sharpen_103',
    type: 'sharpen',
    tier: 1,
    difficultyLevel: 1,
    title: 'Name the Thing',
    instruction: 'Replace vague references ("thing," "stuff," "it") with specific nouns.',
    prompt:
      'The thing is that people don\'t really understand how much this stuff actually matters for the company going forward.',
    hints: ['What is "this stuff"? Name it specifically.', 'What does "matters" mean here — revenue? retention? morale?'],
  },
  {
    id: 'sharpen_104',
    type: 'sharpen',
    tier: 1,
    difficultyLevel: 2,
    title: 'Tighten the Update',
    instruction: 'Rewrite this status update to be crisp and informative. Every word should carry weight.',
    prompt:
      'We had a really great meeting where we talked about a lot of different things and I think we made some good progress on a number of important items that we\'ve been meaning to address for a while now.',
    hints: ['What items? What progress? Be specific.', 'A good status update names decisions made and next steps.'],
  },
  {
    id: 'sharpen_105',
    type: 'sharpen',
    tier: 1,
    difficultyLevel: 2,
    title: 'Kill the Qualifiers',
    instruction: 'Remove every qualifier and hedge. Make the statement land with full conviction.',
    prompt:
      'It\'s not that the design is necessarily bad per se, it\'s just that it could potentially be improved in some ways that might make it slightly more effective for certain users.',
    hints: ['What specific improvement do you actually want?', 'Replace "not bad" framing with a direct statement of what IS needed.'],
  },
  {
    id: 'sharpen_106',
    type: 'sharpen',
    tier: 1,
    difficultyLevel: 3,
    title: 'The Bloated Email',
    instruction:
      'Rewrite this entire message in 2-3 sentences max. Preserve the request and the deadline.',
    prompt:
      'Hi team, I just wanted to reach out and touch base with everyone to see if there might be a chance that we could possibly get together sometime this week, maybe Thursday or Friday if that works for everyone, to have a quick chat about some of the feedback that has been coming in from customers recently regarding the new onboarding flow. It seems like there might be some issues that we should probably look into sooner rather than later. Please let me know your availability when you get a chance.',
    hints: ['Lead with the meeting request and purpose.', 'End with the deadline, not "when you get a chance."'],
  },

  // Speak Sharp exercises (Tier 1 — Precision focus)
  {
    id: 'speak_sharp_101',
    type: 'speak_sharp',
    tier: 1,
    difficultyLevel: 1,
    title: 'The Elevator Intro',
    instruction:
      'Describe what you do (your job, your project, or your company) in 30 seconds. No filler words, no vague language. Every sentence should be specific.',
    prompt:
      'Introduce yourself and what you do to a stranger at a conference. Be precise — no "basically," "kind of," or "sort of." Name specifics.',
    timeLimit: 30,
  },
  {
    id: 'speak_sharp_102',
    type: 'speak_sharp',
    tier: 1,
    difficultyLevel: 2,
    title: 'One-Sentence Summary',
    instruction:
      'Explain a complex topic you know well in exactly one clear sentence. Then expand with one supporting detail. 30 seconds total.',
    prompt:
      'Pick any topic you know deeply (AI, cooking, finance, fitness — anything). Deliver a precise one-sentence explanation followed by one concrete supporting fact. No hedging.',
    timeLimit: 30,
  },
]

// ─── TIER 2: STRUCTURE ───

const TIER_2_EXERCISES: ArticulationExercise[] = [
  // Scaffold exercises
  {
    id: 'scaffold_201',
    type: 'scaffold',
    tier: 2,
    difficultyLevel: 1,
    title: 'The Remote Work Case',
    instruction:
      'Arrange these points into a structured argument. Add an opening statement, transitions between points, and a closing statement.',
    prompt: `• Remote workers report 22% higher job satisfaction
• Communication tools have matured significantly since 2020
• Companies save an average of $11,000 per remote worker annually
• Some tasks require in-person collaboration
• Hybrid models give employees flexibility while maintaining team cohesion`,
    hints: ['Start with your strongest point or a bold claim.', 'Address the counterpoint (in-person collaboration) before your conclusion.'],
  },
  {
    id: 'scaffold_202',
    type: 'scaffold',
    tier: 2,
    difficultyLevel: 1,
    title: 'The AI in Education Argument',
    instruction:
      'Build a balanced argument from these points. Include a clear thesis, supporting evidence, a counterpoint, and a resolution.',
    prompt: `• Personalized learning paths adapt to each student's pace
• Teachers spend 50% of their time on grading and administration
• Students in AI-tutored programs show 30% faster concept mastery
• Human mentorship cannot be replaced by software
• AI tools can handle routine assessment, freeing teachers for deeper engagement`,
    hints: ['The counterpoint about human mentorship is real — don\'t dismiss it, resolve it.', 'Your thesis should acknowledge both sides.'],
  },
  {
    id: 'scaffold_203',
    type: 'scaffold',
    tier: 2,
    difficultyLevel: 2,
    title: 'The Sleep Pitch',
    instruction:
      'These points support a persuasive case for organizational sleep policies. Structure them into a compelling 3-paragraph argument with clear transitions.',
    prompt: `• Memory consolidation happens primarily during REM sleep
• After 17 hours awake, cognitive performance equals 0.05 BAC
• Naps of 20 minutes improve alertness by 40%
• Most executives average less than 6 hours of sleep
• Sleep deprivation costs US businesses $411 billion annually
• The World Health Organization classifies night shift work as a probable carcinogen`,
    hints: ['Lead with the business cost to grab executive attention.', 'The WHO fact is your credibility anchor — place it strategically.'],
  },

  // Distill exercises
  {
    id: 'distill_201',
    type: 'distill',
    tier: 2,
    difficultyLevel: 1,
    title: 'The Revenue Report',
    instruction: 'Compress this paragraph to 12 words or fewer. Preserve the core finding and its cause.',
    prompt:
      'After conducting an extensive analysis of our quarterly financial performance indicators, it has become apparent to the management team that there is a notable and concerning trend of declining revenue in our core product line, which we believe is primarily attributable to increased competitive pressure from newer market entrants who are offering similar solutions at significantly lower price points.',
    wordLimit: 12,
  },
  {
    id: 'distill_202',
    type: 'distill',
    tier: 2,
    difficultyLevel: 2,
    title: 'The Customer Feedback',
    instruction: 'Compress to 10 words or fewer. Capture the conclusion and the urgency.',
    prompt:
      'In light of the numerous and varied pieces of feedback that we have received from a significant number of our most valued customers over the course of the past several months, it has become increasingly clear to us that there is a pressing need to fundamentally rethink and redesign our user onboarding experience from the ground up.',
    wordLimit: 10,
  },
  {
    id: 'distill_203',
    type: 'distill',
    tier: 2,
    difficultyLevel: 3,
    title: 'The Delay Notice',
    instruction: 'Compress to 8 words or fewer. Keep the timeline and the reason.',
    prompt:
      'The implementation of the new software system, which was originally scheduled to be completed by the end of the third quarter, has unfortunately experienced some delays due to unforeseen technical complications that arose during the integration testing phase, and will now require an additional period of approximately six weeks before it can be fully deployed to the production environment.',
    wordLimit: 8,
  },

  // Speak Sharp exercises (Tier 2 — Structure focus)
  {
    id: 'speak_sharp_201',
    type: 'speak_sharp',
    tier: 2,
    difficultyLevel: 1,
    title: 'Problem-Solution-Benefit',
    instruction:
      'Make a 60-second case for remote work using this structure: State the problem (15s), present your solution (25s), name the benefit (20s).',
    prompt:
      'Argue for or against remote work using a clear problem → solution → benefit structure. Each section should transition smoothly into the next.',
    timeLimit: 60,
  },
  {
    id: 'speak_sharp_202',
    type: 'speak_sharp',
    tier: 2,
    difficultyLevel: 2,
    title: 'The Three Reasons',
    instruction:
      'Give exactly three reasons why everyone should learn to cook. Number them ("First... Second... Third..."). 45 seconds.',
    prompt:
      'Present three clear, numbered reasons supporting your argument. Use explicit transitions between points. No rambling — each reason gets one supporting sentence.',
    timeLimit: 45,
  },
]

// ─── TIER 3: CONFIDENCE ───

const TIER_3_EXERCISES: ArticulationExercise[] = [
  // Power Up exercises
  {
    id: 'power_up_301',
    type: 'power_up',
    tier: 3,
    difficultyLevel: 1,
    title: 'Passive to Active',
    instruction: 'Rewrite in active voice with strong verbs. Remove all passive constructions.',
    prompt:
      'It was decided by the team that the project should probably be postponed until further resources can be allocated by management.',
    hints: ['Who decided? Who allocates? Name the actors.', 'Replace "should probably be" with a direct verb.'],
  },
  {
    id: 'power_up_302',
    type: 'power_up',
    tier: 3,
    difficultyLevel: 1,
    title: 'Own Your Statement',
    instruction: 'Remove every hedge word. Make this statement land with full confidence.',
    prompt:
      'I feel like we might want to consider the possibility of maybe going in a different direction with the product strategy.',
    hints: ['"I feel like" and "might want to consider the possibility" — that\'s 4 layers of hedging on one idea.'],
  },
  {
    id: 'power_up_303',
    type: 'power_up',
    tier: 3,
    difficultyLevel: 2,
    title: 'The Weak Request',
    instruction: 'Rewrite as a clear, professional, direct request. No softening language.',
    prompt:
      'It would be really appreciated if you could possibly find some time to maybe look at this document when you get a chance, if it\'s not too much trouble.',
    hints: ['What do you actually need? State it. By when?'],
  },
  {
    id: 'power_up_304',
    type: 'power_up',
    tier: 3,
    difficultyLevel: 2,
    title: 'The Buried Finding',
    instruction: 'Rewrite so the finding leads. Active voice, strong verbs, no qualifiers.',
    prompt:
      'The report was reviewed by me and I think there are probably some issues that might need to be addressed at some point regarding the accuracy of the data that was collected during the survey process.',
    hints: ['Lead with what you found, not that you reviewed.', 'How many issues? What kind of accuracy problems?'],
  },
  {
    id: 'power_up_305',
    type: 'power_up',
    tier: 3,
    difficultyLevel: 3,
    title: 'The Apology Email',
    instruction:
      'Rewrite this entire message to be direct, confident, and solution-oriented. Keep it professional but remove all over-apologizing.',
    prompt:
      'I\'m really sorry to bother you about this, and I know you\'re probably super busy, but I was kind of wondering if maybe there might have been a small issue with the numbers in the report? I could be wrong, of course, and I don\'t want to cause any problems, but it seems like the totals might possibly not add up correctly. Again, sorry to bring this up.',
    hints: ['You found an error. That\'s valuable, not a nuisance.', 'Lead with the finding, suggest the fix, skip the apology.'],
  },

  // Scaffold exercises (Tier 3 — confidence-focused structuring)
  {
    id: 'scaffold_301',
    type: 'scaffold',
    tier: 3,
    difficultyLevel: 2,
    title: 'The Promotion Case',
    instruction:
      'Structure these points into a confident self-advocacy argument. No hedging, no false modesty. Use assertive language throughout.',
    prompt: `• Led the migration that reduced infrastructure costs by 35%
• Mentored two junior developers who are now mid-level
• Consistently delivered projects ahead of schedule for 8 months
• Took ownership of the on-call rotation redesign nobody else wanted
• Received "exceeds expectations" on last two performance reviews`,
    hints: ['Lead with your strongest, most quantifiable achievement.', 'End with a clear ask, not a hint.'],
  },

  // Speak Sharp exercises (Tier 3 — Confidence focus)
  {
    id: 'speak_sharp_301',
    type: 'speak_sharp',
    tier: 3,
    difficultyLevel: 1,
    title: 'The Decisive Answer',
    instruction:
      'Your manager asks: "Should we rebuild the backend or patch it?" Give a decisive 45-second answer. Pick a side. No "it depends" — commit to a recommendation and defend it.',
    prompt:
      'Take a clear position and defend it with 2 reasons. Start with your recommendation, then support it. Zero hedging.',
    timeLimit: 45,
  },
  {
    id: 'speak_sharp_302',
    type: 'speak_sharp',
    tier: 3,
    difficultyLevel: 2,
    title: 'Disagree Respectfully',
    instruction:
      'Your colleague proposes switching to a new tool. You disagree. Deliver a 45-second response that\'s direct but respectful. No passive-aggressive softening.',
    prompt:
      'State your disagreement clearly in the first sentence. Give two concrete reasons. Offer an alternative. No "I could be wrong but..." qualifiers.',
    timeLimit: 45,
  },
]

// ─── TIER 4: PERSUASION ───

const TIER_4_EXERCISES: ArticulationExercise[] = [
  // Reframe exercises
  {
    id: 'reframe_401',
    type: 'reframe',
    tier: 4,
    difficultyLevel: 1,
    title: 'The Tech Analogy',
    instruction: 'Explain this technical concept using a vivid everyday analogy that a non-technical person would instantly understand.',
    prompt:
      'A load balancer distributes incoming network traffic across multiple servers so that no single server becomes overwhelmed.',
    hints: ['Think about everyday situations where work gets distributed — restaurants, highways, checkout lines.'],
  },
  {
    id: 'reframe_402',
    type: 'reframe',
    tier: 4,
    difficultyLevel: 1,
    title: 'The Finance Reframe',
    instruction: 'Make this financial concept memorable by reframing it with a concrete, physical analogy.',
    prompt:
      'Compound interest means your money earns returns on its previous returns, so growth accelerates over time.',
    hints: ['Think about things in nature that grow faster as they get bigger — snowballs, avalanches, populations.'],
  },
  {
    id: 'reframe_403',
    type: 'reframe',
    tier: 4,
    difficultyLevel: 2,
    title: 'The Risk Reframe',
    instruction: 'Reframe this concept so it feels intuitive rather than abstract. Use an analogy from everyday life.',
    prompt:
      'Diversifying investments reduces risk by spreading money across different asset types, so poor performance in one area is offset by gains in another.',
    hints: ['Think about other domains where spreading risk is common sense — food, travel, skills.'],
  },
  {
    id: 'reframe_404',
    type: 'reframe',
    tier: 4,
    difficultyLevel: 2,
    title: 'The Concept Shift',
    instruction:
      'Reframe this abstract idea into something a high school student would understand and remember.',
    prompt:
      'Technical debt is the accumulated cost of shortcuts taken during software development that must eventually be repaid through refactoring or rewriting.',
    hints: ['Think about analogies from school, chores, or home maintenance.'],
  },
  {
    id: 'reframe_405',
    type: 'reframe',
    tier: 4,
    difficultyLevel: 3,
    title: 'The Audience Shift',
    instruction:
      'Explain this concept two ways: once for a CEO (business value), once for an engineer (technical value). Each version should be 1-2 sentences.',
    prompt:
      'Automated testing runs predefined checks on software after every code change, catching bugs before they reach users.',
    hints: ['CEO cares about: money saved, risk reduced, speed gained.', 'Engineer cares about: confidence, iteration speed, regression prevention.'],
  },

  // Speak Sharp exercises (Tier 4 — Persuasion focus)
  {
    id: 'speak_sharp_401',
    type: 'speak_sharp',
    tier: 4,
    difficultyLevel: 2,
    title: 'The Price Objection',
    instruction:
      'A client says: "Your competitor is 40% cheaper." Reframe the conversation in 45 seconds. Don\'t attack the competitor — shift focus to value.',
    prompt:
      'Respond to a price objection by reframing from cost to value. Use a concrete analogy or comparison. End with a question that redirects the conversation.',
    timeLimit: 45,
  },
  {
    id: 'speak_sharp_402',
    type: 'speak_sharp',
    tier: 4,
    difficultyLevel: 3,
    title: 'Explain Like I\'m New',
    instruction:
      'Explain what AI does to someone who has never used a computer. 60 seconds. Use only analogies and concrete examples — no jargon.',
    prompt:
      'Make a complex technical topic feel simple and intuitive through analogy. Your listener has zero technical background. If they furrow their brow, you\'ve lost.',
    timeLimit: 60,
  },
]

// ─── TIER 5: MASTERY ───

const TIER_5_EXERCISES: ArticulationExercise[] = [
  // Mixed text exercises — combining skills
  {
    id: 'sharpen_501',
    type: 'sharpen',
    tier: 5,
    difficultyLevel: 3,
    title: 'The Executive Brief',
    instruction:
      'Rewrite this rambling update into a crisp 3-sentence executive brief. Sentence 1: the finding. Sentence 2: the impact. Sentence 3: the recommendation.',
    prompt:
      'So basically what we\'ve been seeing over the past couple of weeks is that there\'s been kind of a significant uptick in the number of customer support tickets that are coming in, and a lot of them seem to be related to the new checkout flow that was deployed last month. The team has been looking into it and it seems like there might be some usability issues, particularly on mobile devices. We\'re not totally sure yet but we think it could potentially be impacting conversion rates, which if true would obviously be something we\'d want to address fairly quickly.',
    hints: ['Find the three facts: what happened, what it costs, and what to do.'],
  },
  {
    id: 'reframe_501',
    type: 'reframe',
    tier: 5,
    difficultyLevel: 3,
    title: 'The Board Room Analogy',
    instruction:
      'Explain this concept using an analogy that would resonate in a board meeting. The analogy must be precise (not just decorative) and lead naturally to a business decision.',
    prompt:
      'A microservices architecture breaks a large application into small, independent services that can be developed, deployed, and scaled separately, but increases operational complexity.',
    hints: ['Think about organizational analogies — departments, supply chains, franchises.'],
  },
  {
    id: 'power_up_501',
    type: 'power_up',
    tier: 5,
    difficultyLevel: 3,
    title: 'The Leadership Memo',
    instruction:
      'Rewrite this as a confident leadership communication. Active voice, clear ownership, specific next steps, zero hedging.',
    prompt:
      'It has come to our attention that there have been some concerns raised by various stakeholders about the potential impact of the proposed changes on existing workflows. While we understand that change can sometimes be difficult, we believe that it might be beneficial for us to explore ways to address these concerns. We would appreciate it if teams could provide feedback at their earliest convenience so that appropriate adjustments can potentially be made.',
    hints: ['Who is doing what, by when? That\'s all this memo needs to say.'],
  },
  {
    id: 'scaffold_501',
    type: 'scaffold',
    tier: 5,
    difficultyLevel: 3,
    title: 'The Investor Pitch',
    instruction:
      'Structure these points into a 60-second investor pitch. Opening hook, problem, solution, traction, ask. Use confident, precise language throughout.',
    prompt: `• 73% of small businesses still manage inventory manually
• Our platform reduces inventory errors by 89% in the first month
• 340 paying customers, $2.1M ARR, growing 15% month-over-month
• $500B market opportunity in SMB supply chain software
• Raising $5M Series A to expand into three new verticals
• Founded by two former Amazon supply chain engineers`,
    hints: ['Open with the market pain, not your credentials.', 'End with the specific ask and what it unlocks.'],
  },

  // Speak Sharp exercises (Tier 5 — Mastery: combine all skills)
  {
    id: 'speak_sharp_501',
    type: 'speak_sharp',
    tier: 5,
    difficultyLevel: 3,
    title: 'The CEO Elevator Pitch',
    instruction:
      'Your CEO asks: "Why should we invest in AI this quarter?" 30 seconds. Be precise (Tier 1), structured (Tier 2), confident (Tier 3), and use one analogy (Tier 4).',
    prompt:
      'Combine all four articulation skills in one tight response. Precision: no vague words. Structure: clear beginning-middle-end. Confidence: no hedging. Persuasion: one memorable analogy.',
    timeLimit: 30,
  },
  {
    id: 'speak_sharp_502',
    type: 'speak_sharp',
    tier: 5,
    difficultyLevel: 3,
    title: 'The Technical Debt Defense',
    instruction:
      'Explain to a non-technical board why the engineering team needs 6 weeks for "technical debt." 60 seconds. Make them feel the urgency without jargon.',
    prompt:
      'Translate a technical engineering need into a business argument. Use concrete analogies, specific numbers, and a clear call to action. No "um," "like," or "basically."',
    timeLimit: 60,
  },
  {
    id: 'speak_sharp_503',
    type: 'speak_sharp',
    tier: 5,
    difficultyLevel: 3,
    title: 'The Rapid Reframe',
    instruction:
      'You have 30 seconds. A skeptic says: "AI will replace all our jobs." Acknowledge the concern, reframe it, and leave them with a memorable closing line.',
    prompt:
      'Handle a hostile framing in real time. Step 1: Validate (don\'t dismiss). Step 2: Reframe with evidence. Step 3: Close with a sticky one-liner.',
    timeLimit: 30,
  },
]

// All exercises combined

export const ARTICULATION_EXERCISES: ArticulationExercise[] = [
  ...TIER_1_EXERCISES,
  ...TIER_2_EXERCISES,
  ...TIER_3_EXERCISES,
  ...TIER_4_EXERCISES,
  ...TIER_5_EXERCISES,
]

// Helper functions

export function getExercisesForTier(tier: ArticulationTier): ArticulationExercise[] {
  return ARTICULATION_EXERCISES.filter((e) => e.tier === tier)
}

export function getExerciseById(id: string): ArticulationExercise | undefined {
  return ARTICULATION_EXERCISES.find((e) => e.id === id)
}

export function getTextExercisesForTier(tier: ArticulationTier): ArticulationExercise[] {
  return ARTICULATION_EXERCISES.filter((e) => e.tier === tier && e.type !== 'speak_sharp')
}

export function getSpokenExercisesForTier(tier: ArticulationTier): ArticulationExercise[] {
  return ARTICULATION_EXERCISES.filter((e) => e.tier === tier && e.type === 'speak_sharp')
}
