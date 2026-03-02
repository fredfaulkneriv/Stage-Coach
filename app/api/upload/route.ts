import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { d1Query, d1Execute } from '@/lib/db'
import { SINGLE_USER_ID } from '@/lib/auth'
import { uploadAudio, buildR2Key } from '@/lib/r2'
import { analyzeSpeech, transcribeWithWorkersAI } from '@/lib/analyze-speech'
import { calculateXP, getLevelFromXP, updateStreakData } from '@/lib/xp'
import { checkAndAwardBadges } from '@/lib/check-badges'
import type { ApiResponse, Badge, GuidedDrillType, PresentationAudience, Session, SessionMode, User } from '@/lib/types'

interface UploadResponse {
  session_id: string
  session: Session
  new_badges: Badge[]
  xp_earned: number
  new_level: string | null
}

export async function POST(req: Request) {
  try {
    const userId = SINGLE_USER_ID

    // 1. Parse form data
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File | null
    const topic = formData.get('topic') as string | null
    const durationStr = formData.get('duration_seconds') as string | null
    const modeRaw = (formData.get('mode') as string | null) ?? 'freestyle'
    const mode: SessionMode = ['freestyle', 'guided', 'mirror', 'presentation_sim', 'hot_seat'].includes(modeRaw)
      ? (modeRaw as SessionMode)
      : 'freestyle'
    const guided_drill = (formData.get('guided_drill') as GuidedDrillType | null) ?? null
    const presentation_audience = (formData.get('presentation_audience') as PresentationAudience | null) ?? null
    const pacer_script = (formData.get('pacer_script') as string | null) ?? null
    const pacer_target_wpm_str = formData.get('pacer_target_wpm') as string | null
    const pacer_target_wpm = pacer_target_wpm_str ? parseInt(pacer_target_wpm_str, 10) : null

    if (!audioFile) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No audio file provided.' },
        { status: 400 }
      )
    }

    const duration_seconds = durationStr ? parseInt(durationStr, 10) : 0

    // 2. Load user profile
    const users = await d1Query<User>(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [userId]
    )
    if (users.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User profile not found. Please complete onboarding.' },
        { status: 404 }
      )
    }
    const user = users[0]

    // 3. Upload to R2
    const sessionId = uuidv4()
    const ext = audioFile.type.includes('mp4')
      ? 'mp4'
      : audioFile.type.includes('ogg')
      ? 'ogg'
      : 'webm'
    const r2Key = buildR2Key(userId, sessionId, ext)

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
    await uploadAudio(r2Key, audioBuffer, audioFile.type)

    // 4. Transcribe with Workers AI Whisper
    let transcript: string
    try {
      transcript = await transcribeWithWorkersAI(audioBuffer, audioFile.type)
    } catch (transcribeError) {
      console.error('Transcription error:', transcribeError)
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to transcribe audio. Please try again.' },
        { status: 500 }
      )
    }

    // 5. Analyze with Claude
    let analysis
    try {
      analysis = await analyzeSpeech({
        transcript,
        duration_seconds,
        coaching_style: user.coaching_style,
        speech_profile: user.speech_profile,
        goal: user.goal,
        mode,
        guided_drill,
        presentation_audience,
        pacer_script,
        pacer_target_wpm,
      })
    } catch (analyzeError) {
      console.error('Analysis error:', analyzeError)
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to analyze your session. Please try again.' },
        { status: 500 }
      )
    }

    // 6. Calculate XP and streak
    const streakData = updateStreakData(
      user.last_session_date,
      user.current_streak,
      user.longest_streak
    )

    const xp_earned = calculateXP({
      duration_seconds,
      overall_score: analysis.overall_score,
      current_streak: streakData.current_streak,
      speech_profile: user.speech_profile,
      clarity_score: analysis.clarity_score,
      structure_score: analysis.structure_score,
    })

    const new_total_xp = user.xp + xp_earned
    const new_level = getLevelFromXP(new_total_xp)
    const prev_level = user.level
    const leveledUp = new_level !== prev_level

    const now = new Date().toISOString()

    // 7. Save session to D1
    await d1Execute(
      `INSERT INTO sessions (
        id, user_id, mode, guided_drill, presentation_audience, topic, duration_seconds, transcript,
        wpm, filler_word_count, filler_word_percentage, filler_words_found,
        pacing_score, clarity_score, structure_score, overall_score,
        coaching_feedback, summary, xp_earned, r2_key,
        pacer_script, pacer_target_wpm, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId,
        userId,
        mode,
        guided_drill ?? null,
        presentation_audience ?? null,
        topic ?? null,
        duration_seconds,
        transcript,
        analysis.wpm ?? null,
        analysis.filler_word_count ?? null,
        analysis.filler_word_percentage ?? null,
        JSON.stringify(analysis.filler_words_found ?? []),
        analysis.pacing_score,
        analysis.clarity_score,
        analysis.structure_score,
        analysis.overall_score,
        JSON.stringify(analysis.coaching_feedback),
        analysis.summary,
        xp_earned,
        r2Key,
        pacer_script ?? null,
        pacer_target_wpm ?? null,
        now,
      ]
    )

    // 8. Update user XP, level, and streak
    await d1Execute(
      `UPDATE users SET
        xp = ?,
        level = ?,
        current_streak = ?,
        longest_streak = ?,
        last_session_date = ?
       WHERE id = ?`,
      [
        new_total_xp,
        new_level,
        streakData.current_streak,
        streakData.longest_streak,
        streakData.last_session_date,
        userId,
      ]
    )

    // 9. Check and award badges
    const new_badges = await checkAndAwardBadges({
      userId,
      sessionId,
      session: {
        duration_seconds,
        filler_word_count: analysis.filler_word_count,
        overall_score: analysis.overall_score,
        structure_score: analysis.structure_score,
        wpm: analysis.wpm,
        coaching_feedback: analysis.coaching_feedback,
      },
      currentStreak: streakData.current_streak,
      speechProfile: user.speech_profile,
    })

    // 10. Build session response object
    const session: Session = {
      id: sessionId,
      user_id: userId,
      mode,
      guided_drill: guided_drill ?? null,
      presentation_audience: presentation_audience ?? null,
      topic: topic ?? null,
      duration_seconds,
      transcript,
      wpm: analysis.wpm,
      filler_word_count: analysis.filler_word_count,
      filler_word_percentage: analysis.filler_word_percentage,
      filler_words_found: analysis.filler_words_found,
      pacing_score: analysis.pacing_score,
      clarity_score: analysis.clarity_score,
      structure_score: analysis.structure_score,
      overall_score: analysis.overall_score,
      coaching_feedback: analysis.coaching_feedback,
      summary: analysis.summary,
      xp_earned,
      r2_key: r2Key,
      pacer_script: pacer_script ?? null,
      pacer_target_wpm: pacer_target_wpm ?? null,
      created_at: now,
    }

    return NextResponse.json<ApiResponse<UploadResponse>>({
      success: true,
      data: {
        session_id: sessionId,
        session,
        new_badges,
        xp_earned,
        new_level: leveledUp ? new_level : null,
      },
    })
  } catch (err) {
    console.error('POST /api/upload error:', err)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
