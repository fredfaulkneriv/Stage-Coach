'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, Square, Loader2 } from 'lucide-react'
import { Waveform } from './waveform'

type ProcessingStep = 'uploading' | 'transcribing' | 'analyzing' | null

interface RecorderProps {
  topic: string | null
  maxDuration: number // seconds
}

const PROCESSING_MESSAGES: Record<NonNullable<ProcessingStep>, string> = {
  uploading: 'Uploading recording…',
  transcribing: 'Transcribing audio…',
  analyzing: 'Analyzing your session…',
}

function getMimeType(): string {
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus'
  if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4'
  return 'audio/ogg'
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function Recorder({ topic, maxDuration }: RecorderProps) {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing'>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [processingStep, setProcessingStep] = useState<ProcessingStep>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const startTimeRef = useRef<number>(0)

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {})
    if (stream) stream.getTracks().forEach((t) => t.stop())
  }, [stream])

  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  // Auto-stop at maxDuration
  useEffect(() => {
    if (elapsed >= maxDuration && status === 'recording') {
      stopRecording()
    }
  }, [elapsed, maxDuration, status]) // eslint-disable-line react-hooks/exhaustive-deps

  async function startRecording() {
    setError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setStream(mediaStream)

      // Wake lock
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

      recorder.start(250) // collect chunks every 250ms
      startTimeRef.current = Date.now()
      setElapsed(0)
      setStatus('recording')

      timerRef.current = setInterval(() => {
        setElapsed((e) => e + 1)
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
    if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {})
    if (stream) stream.getTracks().forEach((t) => t.stop())
    setStream(null)
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
      if (topic) formData.append('topic', topic)

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

  if (permissionDenied) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#EF444422',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
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

  if (status === 'processing') {
    return (
      <div
        style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          padding: '2rem',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--accent-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        padding: '1rem 0',
      }}
    >
      {/* Timer */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: '3.5rem',
            color: status === 'recording' ? 'var(--accent)' : 'var(--text-muted)',
            letterSpacing: '-2px',
            lineHeight: 1,
          }}
        >
          {formatTime(elapsed)}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 4 }}>
          {status === 'recording'
            ? `Max ${formatTime(maxDuration)}`
            : 'Tap to start recording'}
        </div>
      </div>

      {/* Waveform */}
      <Waveform stream={stream} active={status === 'recording'} />

      {/* Record / Stop button */}
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
          onMouseDown={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)'
          }}
          onMouseUp={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
          }}
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
            background: 'var(--error)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 8px #EF444422',
            transition: 'transform 0.1s',
          }}
        >
          <Square size={28} color="white" fill="white" />
        </button>
      )}

      {status === 'recording' && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
          Tap the button to stop &amp; analyze
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
