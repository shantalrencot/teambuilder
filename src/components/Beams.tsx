import { useEffect, useRef } from 'react'
import { clockSubscribe } from '../lib/animationClock'

interface BeamsProps {
  beamWidth?: number
  beamHeight?: number
  beamNumber?: number
  lightColor?: string
  speed?: number
  noiseIntensity?: number
  rotation?: number
  className?: string
}

interface Beam {
  x: number
  y: number
  width: number
  height: number
  baseOpacity: number
  speed: number
  phaseOffset: number
}

export default function Beams({
  beamWidth = 3,
  beamHeight = 30,
  beamNumber = 20,
  lightColor = '#ffffff',
  speed = 2,
  noiseIntensity = 1.75,
  rotation = 30,
  className = '',
}: BeamsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0, height = 0, diagonal = 0
    let beams: Beam[] = []

    function resize() {
      if (!canvas) return
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
      diagonal = Math.sqrt(width * width + height * height) * 1.5
    }

    function createBeam(index: number): Beam {
      const spacing = diagonal / beamNumber
      return {
        x: -diagonal / 2 + spacing * index + (Math.random() - 0.5) * spacing * 0.5,
        y: -diagonal,
        width: beamWidth * (0.6 + Math.random() * 0.8),
        height: beamHeight,
        baseOpacity: 0.03 + Math.random() * 0.09,
        speed: speed * (0.6 + Math.random() * 0.8),
        phaseOffset: Math.random() * Math.PI * 2,
      }
    }

    function init() {
      resize()
      beams = Array.from({ length: beamNumber }, (_, i) => createBeam(i))
    }

    function tick(timestamp: number): void {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#364033'
      ctx.fillRect(0, 0, width, height)

      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.rotate((rotation * Math.PI) / 180)

      const sinR = Math.abs(Math.sin((rotation * Math.PI) / 180))
      const cosR = Math.abs(Math.cos((rotation * Math.PI) / 180))
      const rotatedHeight = width * sinR + height * cosR
      const t = timestamp * 0.001

      for (const beam of beams) {
        const noise = Math.sin(t * 0.8 + beam.phaseOffset) * noiseIntensity * 0.03
        const currentOpacity = Math.max(0, Math.min(0.15, beam.baseOpacity + noise))
        beam.y += beam.speed * 0.4
        const beamPxHeight = (beam.height / 100) * diagonal
        if (beam.y > rotatedHeight / 2 + beamPxHeight) beam.y = -diagonal
        ctx.fillStyle = lightColor
        ctx.globalAlpha = currentOpacity
        ctx.fillRect(beam.x - beam.width / 2, beam.y - beamPxHeight / 2, beam.width, beamPxHeight)
      }
      ctx.globalAlpha = 1
      ctx.restore()
    }

    const resizeObserver = new ResizeObserver(() => resize())
    resizeObserver.observe(canvas)
    init()
    const unsubscribe = clockSubscribe(tick)
    return () => { unsubscribe(); resizeObserver.disconnect() }
  }, [beamWidth, beamHeight, beamNumber, lightColor, speed, noiseIntensity, rotation])

  return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${className}`} style={{ display: 'block' }} />
}
