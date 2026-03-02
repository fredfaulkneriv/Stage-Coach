export type Goal =
  | 'conference_speaking'
  | 'job_interviews'
  | 'classroom'
  | 'podcast_hosting'
  | 'sales_pitches'

export type CoachingStyle =
  | 'tough_love'
  | 'encouraging'
  | 'data_driven'
  | 'socratic'

export type SpeechProfile = 'standard' | 'stutter_aware'

export type Level =
  | 'Novice'
  | 'Communicator'
  | 'Presenter'
  | 'Speaker'
  | 'Orator'
  | 'Master'

export type SessionMode =
  | 'freestyle'
  | 'guided'
  | 'mirror'
  | 'presentation_sim'
  | 'hot_seat'
  | 'pacer'

export type GuidedDrillType =
  | 'hook'
  | 'three_point'
  | 'star_story'
  | 'strong_close'
  | 'prep_response'

export type PresentationAudience =
  | 'executives'
  | 'general'
  | 'technical'
  | 'investors'
  | 'students'
  | 'clients'

export interface GuidedDrill {
  type: GuidedDrillType
  name: string
  description: string
  steps: { label: string; hint: string }[]
  recommendedDuration: number // seconds
}

export interface User {
  id: string
  email: string
  name: string
  goal: Goal
  coaching_style: CoachingStyle
  speech_profile: SpeechProfile
  level: Level
  xp: number
  current_streak: number
  longest_streak: number
  last_session_date: string | null
  created_at: string
}

export interface CoachingFeedbackItem {
  type: 'strength' | 'improvement' | 'tip'
  message: string
}

export interface Session {
  id: string
  user_id: string
  mode: SessionMode
  topic: string | null
  guided_drill: string | null
  presentation_audience: string | null
  duration_seconds: number
  transcript: string | null
  wpm: number | null
  filler_word_count: number | null
  filler_word_percentage: number | null
  filler_words_found: string[] | null
  pacing_score: number | null
  clarity_score: number | null
  structure_score: number | null
  overall_score: number | null
  coaching_feedback: CoachingFeedbackItem[] | null
  summary: string | null
  xp_earned: number
  r2_key: string | null
  pacer_script: string | null
  pacer_target_wpm: number | null
  created_at: string
}

export interface Badge {
  id: string
  user_id: string
  badge_key: string
  badge_name: string
  badge_description: string
  earned_at: string
  session_id: string | null
}

export interface SpeechAnalysis {
  wpm: number | null
  filler_word_count: number | null
  filler_word_percentage: number | null
  filler_words_found: string[] | null
  pacing_score: number
  clarity_score: number
  structure_score: number
  overall_score: number
  coaching_feedback: CoachingFeedbackItem[]
  summary: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}
