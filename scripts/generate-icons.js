#!/usr/bin/env node
/**
 * Generates placeholder PWA icons using the `canvas` npm package.
 * Run: node scripts/generate-icons.js
 * Requires: npm install canvas (dev dependency)
 */

const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

const SIZES = [192, 512]
const BG_COLOR = '#00D4AA'
const ICON_COLOR = '#0F1B2D'
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'icons')

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

function drawMicIcon(ctx, size) {
  const s = size
  const cx = s / 2
  const cy = s / 2
  const scale = s / 192 // normalise to 192px design

  // Mic body (rounded rectangle)
  const mw = 28 * scale
  const mh = 50 * scale
  const mr = 14 * scale
  const mx = cx - mw / 2
  const my = cy - mh / 2 - 8 * scale

  ctx.beginPath()
  ctx.roundRect(mx, my, mw, mh, mr)
  ctx.fill()

  // Mic stand arc
  const arcR = 28 * scale
  ctx.beginPath()
  ctx.arc(cx, cy + 14 * scale, arcR, Math.PI, 0, false)
  ctx.strokeStyle = ICON_COLOR
  ctx.lineWidth = 5 * scale
  ctx.lineCap = 'round'
  ctx.stroke()

  // Stand pole
  ctx.beginPath()
  ctx.moveTo(cx, cy + 14 * scale + arcR)
  ctx.lineTo(cx, cy + 14 * scale + arcR + 10 * scale)
  ctx.stroke()

  // Stand base
  ctx.beginPath()
  ctx.moveTo(cx - 16 * scale, cy + 14 * scale + arcR + 10 * scale)
  ctx.lineTo(cx + 16 * scale, cy + 14 * scale + arcR + 10 * scale)
  ctx.stroke()
}

for (const size of SIZES) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = BG_COLOR
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, size * 0.22)
  ctx.fill()

  // Icon
  ctx.fillStyle = ICON_COLOR
  drawMicIcon(ctx, size)

  const outPath = path.join(OUTPUT_DIR, `icon-${size}.png`)
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(outPath, buffer)
  console.log(`Generated ${outPath}`)
}

console.log('Icons generated successfully.')
