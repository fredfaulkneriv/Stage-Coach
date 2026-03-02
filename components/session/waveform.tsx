'use client'

import { useEffect, useRef } from 'react'

interface WaveformProps {
  stream: MediaStream | null
  active: boolean
}

const BAR_COUNT = 32

export function Waveform({ stream, active }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const contextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (!active || !stream) {
      // Idle animation
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      let frame = 0
      function drawIdle() {
        if (!canvas || !ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const barWidth = canvas.width / BAR_COUNT
        const gap = 2
        frame++

        for (let i = 0; i < BAR_COUNT; i++) {
          const t = (frame + i * 4) * 0.04
          const h = (Math.sin(t) * 0.3 + 0.4) * canvas.height * 0.3
          const x = i * barWidth + gap / 2
          const y = (canvas.height - h) / 2
          ctx.fillStyle = '#00D4AA33'
          ctx.beginPath()
          ctx.roundRect(x, y, barWidth - gap, h, 2)
          ctx.fill()
        }
        animRef.current = requestAnimationFrame(drawIdle)
      }

      animRef.current = requestAnimationFrame(drawIdle)
      return () => cancelAnimationFrame(animRef.current)
    }

    // Active audio analysis
    const audioCtx = new AudioContext()
    contextRef.current = audioCtx
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 64
    analyserRef.current = analyser

    const source = audioCtx.createMediaStreamSource(stream)
    source.connect(analyser)

    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    const canvas = canvasRef.current

    function draw() {
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      analyser.getByteFrequencyData(dataArray)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = canvas.width / BAR_COUNT
      const gap = 2

      for (let i = 0; i < BAR_COUNT; i++) {
        const idx = Math.floor((i / BAR_COUNT) * dataArray.length)
        const normalized = (dataArray[idx] ?? 0) / 255
        const h = Math.max(4, normalized * canvas.height * 0.85)
        const x = i * barWidth + gap / 2
        const y = (canvas.height - h) / 2

        const alpha = 0.4 + normalized * 0.6
        ctx.fillStyle = `rgba(0, 212, 170, ${alpha})`
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth - gap, h, 2)
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      audioCtx.close()
    }
  }, [stream, active])

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={80}
      style={{ width: '100%', maxWidth: 320, height: 80 }}
    />
  )
}
