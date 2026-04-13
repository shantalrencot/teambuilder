import { useEffect, useRef } from 'react'
import { clockSubscribe } from '../lib/animationClock'

interface ParticlesProps {
  particleColors?: string[]
  particleCount?: number
  speed?: number
  particleBaseSize?: number
  moveParticlesOnHover?: boolean
  className?: string
}

interface Particle {
  x: number; y: number; vx: number; vy: number
  size: number; color: string; opacity: number
}

export default function Particles({
  particleColors = ['#fefefe', '#c9a84c'],
  particleCount = 200,
  speed = 0.1,
  particleBaseSize = 100,
  moveParticlesOnHover = true,
  className = '',
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0, height = 0
    let particles: Particle[] = []

    function resize() {
      if (!canvas) return
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    }

    function createParticle(): Particle {
      const angle = Math.random() * Math.PI * 2
      const spd = (Math.random() * 0.5 + 0.3) * speed
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: (Math.random() * 2 + 0.5) * (particleBaseSize / 100),
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        opacity: Math.random() * 0.6 + 0.2,
      }
    }

    function tick(_timestamp: number): void {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, width, height)
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const repelRadius = 150
      const maxSpd = speed * 4

      for (const p of particles) {
        if (moveParticlesOnHover) {
          const dx = p.x - mx, dy = p.y - my
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < repelRadius && dist > 0) {
            const force = (repelRadius - dist) / repelRadius
            p.vx += (dx / dist) * force * 0.4
            p.vy += (dy / dist) * force * 0.4
          }
        }
        p.vx *= 0.99; p.vy *= 0.99
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (spd > maxSpd) { p.vx = (p.vx / spd) * maxSpd; p.vy = (p.vy / spd) * maxSpd }
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x += width; if (p.x > width) p.x -= width
        if (p.y < 0) p.y += height; if (p.y > height) p.y -= height
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    function onMouseLeave() { mouseRef.current = { x: -9999, y: -9999 } }

    const resizeObserver = new ResizeObserver(() => resize())
    resizeObserver.observe(canvas)
    if (moveParticlesOnHover) {
      canvas.addEventListener('mousemove', onMouseMove)
      canvas.addEventListener('mouseleave', onMouseLeave)
    }
    resize()
    particles = Array.from({ length: particleCount }, createParticle)
    const unsubscribe = clockSubscribe(tick)
    return () => {
      unsubscribe(); resizeObserver.disconnect()
      if (moveParticlesOnHover) {
        canvas.removeEventListener('mousemove', onMouseMove)
        canvas.removeEventListener('mouseleave', onMouseLeave)
      }
    }
  }, [particleColors, particleCount, speed, particleBaseSize, moveParticlesOnHover])

  return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${className}`} style={{ display: 'block' }} />
}
