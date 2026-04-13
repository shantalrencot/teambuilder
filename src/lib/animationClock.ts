/**
 * animationClock - shared requestAnimationFrame dispatcher
 * All canvas components (Particles, Beams) subscribe to this single RAF loop.
 */

type TickFn = (timestamp: number) => void

const subscribers = new Set<TickFn>()
let rafId = 0
let running = false

function tick(timestamp: number): void {
  for (const fn of Array.from(subscribers)) {
    fn(timestamp)
  }
  if (subscribers.size > 0) {
    rafId = requestAnimationFrame(tick)
  } else {
    running = false
  }
}

export function clockSubscribe(fn: TickFn): () => void {
  subscribers.add(fn)
  if (!running) {
    running = true
    rafId = requestAnimationFrame(tick)
  }
  return function clockUnsubscribe(): void {
    subscribers.delete(fn)
    if (subscribers.size === 0 && running) {
      cancelAnimationFrame(rafId)
      running = false
    }
  }
}
