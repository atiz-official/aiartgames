import { Camera, CircleDot, RotateCcw, Sparkles, Zap } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

type Phase = 'ready' | 'setup' | 'choose' | 'timing' | 'result'
type Energy = 'normal' | 'hero' | 'chaos' | 'cursed'

type RealityOutcome = {
  id: string
  label: string
  caption: string
  rarity: string
  target: { x: number; y: number }
  ballColor: string
  keeperDive: 'left' | 'right' | 'center' | 'hold'
  flight: 'driven' | 'rising' | 'curl' | 'sky' | 'panenka' | 'portal'
  impact: 'net' | 'save' | 'post' | 'miss' | 'portal'
  curve: number
  spin: number
  effect: 'clean' | 'save' | 'post' | 'sky' | 'fan' | 'portal' | 'multi'
}

const BRANCH_TIME = 3.05
const BALL_START = { x: 42.4, y: 70.8 }

const energyCopy: Record<Energy, { title: string; description: string }> = {
  normal: { title: 'Normal', description: 'Reality stays mostly legal.' },
  hero: { title: 'Hero', description: 'Bias toward cinematic redemption.' },
  chaos: { title: 'Chaos', description: 'The internet enters the pitch.' },
  cursed: { title: 'Cursed', description: 'VAR opens forbidden doors.' },
}

function randomSeed() {
  return Math.floor(Math.random() * 1_000_000)
}

function seeded(seed: number) {
  let value = seed % 2147483647
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

function pickOutcome(energy: Energy, timing: number, seed: number): RealityOutcome {
  const rand = seeded(seed)
  const precision = 1 - Math.min(1, Math.abs(timing - 0.5) * 2)
  const luck = rand()
  const power = precision * 0.72 + luck * 0.28

  if (energy === 'chaos' && luck > 0.34) {
    return {
      id: 'fan-steals-kick',
      label: 'Fan Timeline',
      caption: 'A random spectator just became canon.',
      rarity: 'absurd',
      target: { x: 48 + rand() * 7, y: 33 + rand() * 8 },
      ballColor: '#9affd0',
      keeperDive: luck > 0.62 ? 'left' : 'right',
      flight: 'curl',
      impact: 'net',
      curve: (rand() - 0.5) * 20,
      spin: 950 + rand() * 520,
      effect: 'fan',
    }
  }

  if (energy === 'cursed' && luck > 0.28) {
    return {
      id: 'var-portal',
      label: 'VAR Portal',
      caption: 'The ball is under review in another dimension.',
      rarity: 'cursed',
      target: { x: 50, y: 30 },
      ballColor: '#b88cff',
      keeperDive: 'center',
      flight: 'portal',
      impact: 'portal',
      curve: (rand() - 0.5) * 10,
      spin: 1400,
      effect: 'portal',
    }
  }

  if (energy === 'hero' && power > 0.52) {
    return {
      id: 'top-bins',
      label: 'Top Bins',
      caption: 'Alternate timeline unlocked.',
      rarity: power > 0.86 ? 'legendary' : 'rare',
      target: { x: luck > 0.5 ? 69 : 31, y: 28 + rand() * 4 },
      ballColor: '#fff3a3',
      keeperDive: luck > 0.5 ? 'left' : 'right',
      flight: 'curl',
      impact: 'net',
      curve: luck > 0.5 ? 16 + rand() * 8 : -16 - rand() * 8,
      spin: 1180 + rand() * 480,
      effect: 'clean',
    }
  }

  if (power > 0.67) {
    return {
      id: 'goal',
      label: 'Goal',
      caption: 'Different timeline. Same pressure.',
      rarity: 'clean',
      target: { x: luck > 0.5 ? 63 : 37, y: 38 + rand() * 6 },
      ballColor: '#ffffff',
      keeperDive: luck > 0.5 ? 'left' : 'right',
      flight: power > 0.78 ? 'rising' : 'driven',
      impact: 'net',
      curve: luck > 0.5 ? 7 + rand() * 6 : -7 - rand() * 6,
      spin: 980 + rand() * 420,
      effect: 'clean',
    }
  }

  if (power > 0.48) {
    return {
      id: 'post',
      label: 'Post',
      caption: 'One inch from rewriting the group chat.',
      rarity: 'painful',
      target: { x: luck > 0.5 ? 73 : 27, y: 36 },
      ballColor: '#ffffff',
      keeperDive: luck > 0.5 ? 'left' : 'right',
      flight: 'rising',
      impact: 'post',
      curve: luck > 0.5 ? 12 : -12,
      spin: 1260,
      effect: 'post',
    }
  }

  if (power > 0.26) {
    return {
      id: 'saved',
      label: 'Saved',
      caption: 'Keeper guessed your timeline.',
      rarity: 'canon-adjacent',
      target: { x: 50 + (luck - 0.5) * 18, y: 43 },
      ballColor: '#ffffff',
      keeperDive: luck > 0.56 ? 'right' : luck < 0.44 ? 'left' : 'center',
      flight: 'driven',
      impact: 'save',
      curve: (luck - 0.5) * 10,
      spin: 900,
      effect: 'save',
    }
  }

  return {
    id: 'sky',
    label: 'Row Z',
    caption: 'The moon has possession now.',
    rarity: 'tragic',
    target: { x: 50 + (luck - 0.5) * 28, y: 8 },
    ballColor: '#ffffff',
    keeperDive: 'hold',
    flight: 'sky',
    impact: 'miss',
    curve: (luck - 0.5) * 18,
    spin: 1500,
    effect: 'sky',
  }
}

function getBallFlightStyle(outcome: RealityOutcome) {
  const midX = (BALL_START.x + outcome.target.x) / 2 + outcome.curve * 0.22
  const verticalLift =
    outcome.flight === 'sky' ? 34 : outcome.flight === 'panenka' ? 25 : outcome.flight === 'curl' ? 18 : outcome.flight === 'rising' ? 14 : 8
  const midY = Math.min(BALL_START.y, outcome.target.y) - verticalLift
  const endScale = outcome.flight === 'sky' ? 0.28 : outcome.impact === 'save' ? 0.52 : 0.36
  const blur = outcome.flight === 'driven' ? 1.8 : 1.1

  return {
    '--start-x': `${BALL_START.x}%`,
    '--start-y': `${BALL_START.y}%`,
    '--mid-x': `${midX}%`,
    '--mid-y': `${midY}%`,
    '--end-x': `${outcome.target.x}%`,
    '--end-y': `${outcome.target.y}%`,
    '--ball-color': outcome.ballColor,
    '--spin': `${outcome.spin}deg`,
    '--end-scale': endScale,
    '--motion-blur': `${blur}px`,
  } as CSSProperties
}

function RealisticBallFlight({ outcome }: { outcome: RealityOutcome }) {
  return (
    <div className={`ball-flight effect-${outcome.effect} flight-${outcome.flight}`} style={getBallFlightStyle(outcome)}>
      <span className="ball-shadow" />
      <span className="ball-trail" />
      <span className="soccer-ball" aria-hidden>
        <i className="panel panel-a" />
        <i className="panel panel-b" />
        <i className="panel panel-c" />
      </span>
    </div>
  )
}

function KeeperReaction({ outcome }: { outcome: RealityOutcome }) {
  return (
    <div className={`keeper-reaction dive-${outcome.keeperDive} effect-${outcome.effect}`} aria-hidden>
      <span className="keeper-head" />
      <span className="keeper-glove glove-left" />
      <span className="keeper-glove glove-right" />
      <span className="keeper-arm arm-left" />
      <span className="keeper-arm arm-right" />
      <span className="keeper-body" />
      <span className="keeper-leg leg-left" />
      <span className="keeper-leg leg-right" />
    </div>
  )
}

function GoalImpact({ outcome }: { outcome: RealityOutcome }) {
  return (
    <div
      className={`goal-impact impact-${outcome.impact}`}
      style={
        {
          '--impact-x': `${outcome.target.x}%`,
          '--impact-y': `${outcome.target.y}%`,
        } as CSSProperties
      }
      aria-hidden
    >
      <span className="impact-core" />
      <span className="net-line line-a" />
      <span className="net-line line-b" />
      <span className="net-line line-c" />
    </div>
  )
}

export function PenaltyRemix() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [phase, setPhase] = useState<Phase>('ready')
  const [energy, setEnergy] = useState<Energy | null>(null)
  const [meter, setMeter] = useState(0)
  const [outcome, setOutcome] = useState<RealityOutcome | null>(null)
  const [timelineId, setTimelineId] = useState('')
  const animationRef = useRef<number | null>(null)

  const source = `${import.meta.env.BASE_URL}footage/source-web.mp4`
  const meterScore = useMemo(() => Math.abs(meter - 0.5), [meter])

  useEffect(() => {
    if (phase !== 'timing') {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      animationRef.current = null
      return
    }

    const started = performance.now()
    const tick = () => {
      setMeter(((performance.now() - started) % 1100) / 1100)
      animationRef.current = requestAnimationFrame(tick)
    }
    animationRef.current = requestAnimationFrame(tick)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [phase])

  function beep(kind: 'whistle' | 'kick' | 'crowd' | 'portal') {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const context = new AudioContextClass()
    const gain = context.createGain()
    gain.connect(context.destination)
    gain.gain.value = kind === 'crowd' ? 0.05 : 0.1
    const osc = context.createOscillator()
    osc.connect(gain)
    osc.type = kind === 'portal' ? 'sawtooth' : 'sine'
    osc.frequency.value = kind === 'whistle' ? 1250 : kind === 'kick' ? 95 : kind === 'portal' ? 180 : 260
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + (kind === 'crowd' ? 1.2 : 0.28))
    osc.stop(context.currentTime + (kind === 'crowd' ? 1.2 : 0.28))
  }

  async function start() {
    setPhase('setup')
    setEnergy(null)
    setOutcome(null)
    setTimelineId('')
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    video.playbackRate = 1
    beep('whistle')
    await video.play()
  }

  function onTimeUpdate() {
    const video = videoRef.current
    if (!video || phase !== 'setup') return
    if (video.currentTime >= BRANCH_TIME) {
      video.pause()
      video.currentTime = BRANCH_TIME
      setPhase('choose')
    }
  }

  function choose(nextEnergy: Energy) {
    setEnergy(nextEnergy)
    setPhase('timing')
  }

  function kick() {
    if (!energy) return
    const seed = randomSeed()
    const nextOutcome = pickOutcome(energy, meter, seed)
    setTimelineId(`#${seed.toString(16).toUpperCase()}`)
    setOutcome(nextOutcome)
    setPhase('result')
    beep(nextOutcome.effect === 'portal' ? 'portal' : 'kick')
    window.setTimeout(() => beep('crowd'), 260)
  }

  return (
    <main className={`penalty-lab phase-${phase}`}>
      <section className="penalty-stage" aria-label="Playable news penalty remix">
        <video ref={videoRef} src={source} muted playsInline preload="auto" onTimeUpdate={onTimeUpdate} />
        <div className="broadcast-grade" />
        <div className="goal-hotspots" aria-hidden>
          <span className="hotspot left">LEFT</span>
          <span className="hotspot center">CENTER</span>
          <span className="hotspot right">RIGHT</span>
        </div>

        {phase === 'ready' && (
          <div className="penalty-card intro-card">
            <span>PLAYABLE NEWS LAB</span>
            <h1>Rewrite the penalty timeline.</h1>
            <p>Real footage as the base layer. You choose the timeline energy, tap the kick, and the moment branches into a new reality.</p>
            <button type="button" onClick={start}>
              <CircleDot size={18} />
              Start remix
            </button>
          </div>
        )}

        {phase === 'setup' && (
          <div className="timeline-banner">
            <span>ORIGINAL TIMELINE PLAYING</span>
            <strong>Decision window incoming</strong>
          </div>
        )}

        {phase === 'choose' && (
          <div className="penalty-card energy-card">
            <span>REALITY PAUSED</span>
            <h2>Choose timeline energy</h2>
            <div className="energy-grid">
              {(Object.keys(energyCopy) as Energy[]).map((key) => (
                <button key={key} type="button" onClick={() => choose(key)}>
                  <strong>{energyCopy[key].title}</strong>
                  <small>{energyCopy[key].description}</small>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'timing' && (
          <button type="button" className="kick-zone" onClick={kick}>
            <span>Tap to kick</span>
            <div className="timing-track">
              <i style={{ left: `${meter * 100}%` }} />
              <b />
            </div>
            <small>{meterScore < 0.08 ? 'Perfect window' : 'Hold nerve'}</small>
          </button>
        )}

        {outcome && (
          <>
            <KeeperReaction outcome={outcome} />
            <RealisticBallFlight outcome={outcome} />
            <GoalImpact outcome={outcome} />
          </>
        )}

        {outcome?.effect === 'fan' && <div className="fan-chaos">FAN TAKES THE SHOT</div>}
        {outcome?.effect === 'portal' && <div className="var-portal">VAR PORTAL</div>}

        {phase === 'result' && outcome && (
          <div className="result-slab">
            <span>{timelineId} - {outcome.rarity}</span>
            <h2>{outcome.label}</h2>
            <p>{outcome.caption}</p>
            <div className="result-actions">
              <button type="button" onClick={start}>
                <RotateCcw size={16} />
                New timeline
              </button>
              <button type="button" onClick={() => window.print()}>
                <Camera size={16} />
                Capture
              </button>
            </div>
          </div>
        )}

        <div className="news-strip">
          <Sparkles size={15} />
          <span>2 sec setup - 3 sec interaction - 3 sec alternate result</span>
          <Zap size={15} />
        </div>
      </section>
    </main>
  )
}
