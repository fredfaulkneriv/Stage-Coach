'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, Square, Loader2 } from 'lucide-react'
import { Waveform } from './waveform'
import type { PacerScript } from '@/lib/pacer-scripts'

type ProcessingStep = 'uploading' | 'transcribing' | 'analyzing' | null

interface PacerRecorderProps {
  script: PacerScript
  targetWpm: number
}

const PROCESSING_MESSAGES: Record<NonNullable<ProcessingStep>, string> = {
  uploading: 'Uploading recording…',
  transcribing: 'Transcribing audio…',
  analyzing: 'Analyzing your session…',
}

const COUNTDOWN_START = 3

function getMimeType(): string {
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus'
  if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4'
  return 'audio/ogg'
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function PacerRecorder({ script, targetWpm }: PacerRecorderProps) {
  const router = useRouter()

  const [status, setStatus] = useState<'idle' | 'recording' | 'processing'>('idle')
  // countdown: 3 → 2 → 1 → null (null means words are advancing)
  const [countdown, setCountdown] = useState<number | null>(null)
  // wordElapsed: only increments after countdown ends — drives word highlighting
  const [wordElapsed, setWordElapsed] = useState(0)
  // elapsed: total recording time including countdown seconds (for display)
  const [elapsed, setElapsed] = useState(0)
  const [processingStep, setProcessingStep] = useState<ProcessingStep>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  // timerRef: drives the countdown + elapsed counter
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // wordTimerRef: drives wordElapsed (starts after countdown ends)
  const wordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const startTimeRef = useRef<number>(0)
  // streamRef: holds the MediaStream for cleanup without being a reactive dep
  const streamRef = useRef<MediaStream | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const teleprompterPRef = useRef<HTMLParagraphElement | null>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])

  // Pre-compute words and timing
  const words = script.text.split(/\s+/).filter(Boolean)
  const scriptDuration = (words.length / targetWpm) * 60 // seconds
  // buffer after script ends before auto-stop
  const maxWordElapsed = Math.ceil(scriptDuration + 10)

  // Word index is driven entirely by wordElapsed (not elapsed), so the
  // countdown gap doesn't push the highlight out of sync
  const currentWordIndex =
    status === 'recording' && countdown === null
      ? Math.min(Math.floor((wordElapsed / 60) * targetWpm), words.length - 1)
      : -1

  const progressPct = Math.min(wordElapsed / scriptDuration, 1)
  const isCountingDown = status === 'recording' && countdown !== null

  // Auto-scroll: center the current word by CSS-transforming the <p> element.
  // The container has position:relative, so wordEl.offsetTop is relative to it.
  // We translate the <p> so the current word sits at the vertical center.
  useEffect(() => {
    const pEl = teleprompterPRef.current
    if (!pEl) return
    if (currentWordIndex < 0) {
      pEl.style.transform = 'translateY(0px)'
      return
    }
    const container = scrollContainerRef.current
    const wordEl = wordRefs.current[currentWordIndex]
    if (!container || !wordEl) return
    const containerHeight = container.clientHeight
    const wordOffset = wordEl.offsetTop   // relative to container (position:relative)
    const wordHeight = wordEl.clientHeight
    const shift = containerHeight / 2 - wordOffset - wordHeight / 2
    pEl.style.transform = `translateY(${shift}px)`
  }, [currentWordIndex])

  // Auto-stop when wordElapsed reaches max (script + 10s buffer)
  useEffect(() => {
    if (status === 'recording' && countdown === null && wordElapsed >= maxWordElapsed) {
      stopRecording()
    }
  }, [wordElapsed, maxWordElapsed, status, countdown]) // eslint-disable-line react-hooks/exhaustive-deps

  // Stable cleanup — empty deps so the effect never re-runs mid-session.
  // Uses streamRef (not stream state) to avoid the ref being captured in a
  // stale closure while keeping cleanup dependency-free.
  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (wordTimerRef.current) clearInterval(wordTimerRef.current)
    if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {})
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, []) // intentionally empty — only runs on unmount

  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  async function startRecording() {
    setError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = mediaStream
      setStream(mediaStream)

      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        } catch {
          // Wake lock not available — non-fatal
        }
      }

      const mimeType = getMimeType()
      const recorder = new MediaRecorder(mediaStream, { mimeType })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
        await uploadAndAnalyze(blob, duration, mimeType)
      }

      // Start recording audio immediately — no audio lost during countdown
      recorder.start(250)
      startTimeRef.current = Date.now()
      setElapsed(0)
      setWordElapsed(0)
      setCountdown(COUNTDOWN_START)
      setStatus('recording')

      // Phase 1: countdown timer
      // Ticks every second, counts down COUNTDOWN_START → 1, then switches to word timer
      let countdownVal = COUNTDOWN_START
      timerRef.current = setInterval(() => {
        setElapsed((e) => e + 1)
        countdownVal -= 1
        if (countdownVal > 0) {
          setCountdown(countdownVal)
        } else {
          // Countdown done — clear this interval, start word advance
          clearInterval(timerRef.current!)
          timerRef.current = null
          setCountdown(null)

          // Phase 2: word advance timer
          wordTimerRef.current = setInterval(() => {
            setWordElapsed((w) => w + 1)
            setElapsed((e) => e + 1)
          }, 1000)
        }
      }, 1000)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setPermissionDenied(true)
      } else {
        setError('Could not access your microphone. Please check your device settings.')
      }
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current)
    if (wordTimerRef.current) clearInterval(wordTimerRef.current)
    timerRef.current = null
    wordTimerRef.current = null
    if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {})
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setStream(null)
    setCountdown(null)
    setStatus('processing')
    mediaRecorderRef.current?.stop()
  }

  async function uploadAndAnalyze(blob: Blob, duration: number, mimeType: string) {
    try {
      const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm'
      const file = new File([blob], `recording.${ext}`, { type: mimeType })

      const formData = new FormData()
      formData.append('audio', file)
      formData.append('duration_seconds', String(duration))
      formData.append('mode', 'pacer')
      formData.append('topic', script.title)
      formData.append('pacer_script', script.text)
      formData.append('pacer_target_wpm', String(targetWpm))

      setProcessingStep('uploading')
      await new Promise((r) => setTimeout(r, 400))
      setProcessingStep('transcribing')

      const res = await fetch('/api/upload', { method: 'POST', body: formData })

      setProcessingStep('analyzing')
      await new Promise((r) => setTimeout(r, 400))

      const json = await res.json()
      if (!json.success) throw new Error(json.error)

      router.push(`/session/${json.data.session_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('idle')
      setProcessingStep(null)
    }
  }

  // ── Permission denied screen ──────────────────────────────────────────────
  if (permissionDenied) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EF444422', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Mic size={28} color="var(--error)" />
        </div>
        <h2 style={{ fontSize: '1.25rem' }}>Microphone Access Required</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 320 }}>
          Stage Coach needs microphone access to analyze your speech. Please enable it in your browser settings and try again.
        </p>
        <button className="btn-secondary" onClick={() => setPermissionDenied(false)}>
          Try Again
        </button>
      </div>
    )
  }

  // ── Processing screen ─────────────────────────────────────────────────────
  if (status === 'processing') {
    return (
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '2rem' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={32} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
        <div>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.125rem', marginBottom: 6 }}>
            {processingStep ? PROCESSING_MESSAGES[processingStep] : 'Processing…'}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            This takes about 15–30 seconds.
          </p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── Main recorder UI ──────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Script display — karaoke word view */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: `1.5px solid ${isCountingDown ? 'var(--warning)55' : status === 'recording' ? 'var(--accent)55' : 'var(--border-subtle)'}`,
          borderRadius: '0.875rem',
          padding: '1rem',
          overflow: 'hidden',
          transition: 'border-color 0.3s',
          position: 'relative',
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            {script.typeEmoji} {script.typeLabel}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Target: {targetWpm} WPM · {formatTime(Math.ceil(scriptDuration))}
          </span>
        </div>

        {/* Countdown overlay — replaces scrolling text during 3-2-1 */}
        {isCountingDown ? (
          <div
            style={{
              height: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: '5rem',
                color: 'var(--accent)',
                lineHeight: 1,
                letterSpacing: '-3px',
              }}
            >
              {countdown}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Get ready…
            </p>
          </div>
        ) : (
          /* Teleprompter word container with gradient fades */
          <div style={{ position: 'relative' }}>
            <div
              ref={scrollContainerRef}
              style={{
                height: 300,
                overflow: 'hidden',
                position: 'relative',
                textAlign: 'center',
              }}
            >
              <p
                ref={teleprompterPRef}
                style={{
                  margin: 0,
                  paddingTop: 150,
                  paddingBottom: 150,
                  lineHeight: 2.0,
                  transition: 'transform 0.25s ease',
                  fontSize: '1.75rem',
                }}
              >
                {words.map((word, i) => {
                  const isCurrent = i === currentWordIndex
                  const isPast = i < currentWordIndex
                  return (
                    <span key={i}>
                      <span
                        ref={(el) => { wordRefs.current[i] = el }}
                        style={{
                          color: isCurrent
                            ? 'var(--accent)'
                            : isPast
                            ? 'var(--text-muted)'
                            : 'var(--text-primary)',
                          fontWeight: isCurrent ? 800 : isPast ? 400 : 500,
                          fontSize: isCurrent ? '2.2rem' : '1.75rem',
                          opacity: isPast ? 0.4 : 1,
                          textDecoration: isCurrent ? 'underline' : 'none',
                          textDecorationColor: 'var(--accent)',
                          textUnderlineOffset: '6px',
                          textDecorationThickness: '3px',
                          transition: 'color 0.15s, font-weight 0.15s, font-size 0.1s, opacity 0.2s',
                        }}
                      >
                        {word}
                      </span>
                      {' '}
                    </span>
                  )
                })}
              </p>
            </div>
            {/* Top gradient fade */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: 90,
              background: 'linear-gradient(to bottom, var(--bg-card) 15%, transparent)',
              pointerEvents: 'none',
            }} />
            {/* Bottom gradient fade */}
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              height: 90,
              background: 'linear-gradient(to top, var(--bg-card) 15%, transparent)',
              pointerEvents: 'none',
            }} />
          </div>
        )}

        {/* Progress bar */}
        <div style={{ marginTop: 10, height: 3, background: 'var(--border-subtle)', borderRadius: 99, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPct * 100}%`,
              background: progressPct >= 1 ? 'var(--success)' : 'var(--accent)',
              borderRadius: 99,
              transition: isCountingDown ? 'none' : 'width 1s linear',
            }}
          />
        </div>
      </div>

      {/* Timer */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: '3rem',
            color: isCountingDown ? 'var(--warning)' : status === 'recording' ? 'var(--accent)' : 'var(--text-muted)',
            letterSpacing: '-2px',
            lineHeight: 1,
          }}
        >
          {formatTime(wordElapsed)}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 4 }}>
          {isCountingDown
            ? 'Starting in…'
            : status === 'recording'
            ? `of ${formatTime(Math.ceil(scriptDuration))} · auto-stops after script`
            : 'Read aloud as the words highlight'}
        </div>
      </div>

      {/* Waveform */}
      <Waveform stream={stream} active={status === 'recording'} />

      {/* Record / Stop button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {status === 'idle' ? (
          <button
            onClick={startRecording}
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'var(--accent)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 8px var(--accent-muted)',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)' }}
            onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
          >
            <Mic size={32} color="#0F1B2D" />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: isCountingDown ? 'var(--warning)' : 'var(--error)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 0 8px ${isCountingDown ? '#F59E0B22' : '#EF444422'}`,
              transition: 'background 0.3s, box-shadow 0.3s',
            }}
          >
            <Square size={28} color="white" fill="white" />
          </button>
        )}
      </div>

      {status === 'recording' && !isCountingDown && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textAlign: 'center' }}>
          Tap to stop early · auto-stops 10s after script ends
        </p>
      )}

      {error && (
        <p style={{ color: 'var(--error)', fontSize: '0.875rem', textAlign: 'center' }}>
          {error}
        </p>
      )}
    </div>
  )
}
