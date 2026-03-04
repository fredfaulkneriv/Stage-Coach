import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { SINGLE_USER_ID } from '@/lib/auth'
import { d1Query, d1Execute } from '@/lib/db'
import { evaluateArticulationExercise } from '@/lib/evaluate-articulation'
import { getExerciseById, getExercisesForTier, TIER_INFO } from '@/lib/articulation-exercises'
import { calculateArticulationXP, getLevelFromXP, updateStreakData } from '@/lib/xp'
import { checkAndAwardArticulationBadges } from '@/lib/check-badges'
import type { User, ArticulationTier } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { exercise_id, user_response } = body

    if (!exercise_id || !user_response?.trim()) {
      return NextResponse.json(
        { success: false, error: 'exercise_id and user_response are required' },
        { status: 400 }
      )
    }

    const exercise = getExerciseById(exercise_id)
    if (!exercise) {
      return NextResponse.json(
        { success: false, error: `Exercise not found: ${exercise_id}` },
        { status: 404 }
      )
    }

    // Load user
    const users = await d1Query<User>(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [SINGLE_USER_ID]
    )
    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    const user = users[0]

    // Evaluate with Claude
    const feedback = await evaluateArticulationExercise(exercise, user_response.trim())

    // Check if this completes the tier
    const existingProgress = await d1Query<{ exercise_id: string }>(
      `SELECT DISTINCT exercise_id FROM articulation_progress
       WHERE user_id = ? AND tier = ? AND score >= 60`,
      [SINGLE_USER_ID, exercise.tier]
    )
    const passedIds = new Set(existingProgress.map((p) => p.exercise_id))
    // Add current exercise if it passes
    if (feedback.score >= 60) passedIds.add(exercise_id)
    const tierExerciseCount = getExercisesForTier(exercise.tier as ArticulationTier).length
    const isTierCompletion =
      passedIds.size >= Math.min(tierExerciseCount, TIER_INFO[exercise.tier].unlockRequirement || tierExerciseCount) &&
      !passedIds.has('__already_counted__')

    // Actually check tier completion: 5+ unique exercises passed in this tier
    const isTierJustCompleted = passedIds.size >= 5 && (passedIds.size - (feedback.score >= 60 ? 1 : 0)) < 5

    // Calculate XP
    const xpEarned = calculateArticulationXP({
      score: feedback.score,
      current_streak: user.current_streak,
      is_tier_completion: isTierJustCompleted,
    })

    // Save progress
    const progressId = uuidv4()
    const now = new Date().toISOString()
    await d1Execute(
      `INSERT INTO articulation_progress (id, user_id, exercise_type, exercise_id, tier, difficulty_level, user_response, score, feedback, xp_earned, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        progressId,
        SINGLE_USER_ID,
        exercise.type,
        exercise.id,
        exercise.tier,
        exercise.difficultyLevel,
        user_response.trim(),
        feedback.score,
        JSON.stringify(feedback),
        xpEarned,
        now,
      ]
    )

    // Update streak
    const streakData = updateStreakData(
      user.last_session_date,
      user.current_streak,
      user.longest_streak
    )

    // Update user XP + streak
    const newXP = user.xp + xpEarned
    const newLevel = getLevelFromXP(newXP)
    await d1Execute(
      `UPDATE users SET xp = ?, level = ?, current_streak = ?, longest_streak = ?, last_session_date = ? WHERE id = ?`,
      [newXP, newLevel, streakData.current_streak, streakData.longest_streak, streakData.last_session_date, SINGLE_USER_ID]
    )

    // Check badges
    const newBadges = await checkAndAwardArticulationBadges({
      userId: SINGLE_USER_ID,
      exerciseType: exercise.type,
      score: feedback.score,
      currentStreak: streakData.current_streak,
    })

    return NextResponse.json({
      success: true,
      data: {
        progress_id: progressId,
        feedback,
        xp_earned: xpEarned,
        new_level: newLevel !== user.level ? newLevel : null,
        new_badges: newBadges,
        tier_just_completed: isTierJustCompleted,
      },
    })
  } catch (error) {
    console.error('Articulation evaluate error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Evaluation failed' },
      { status: 500 }
    )
  }
}
