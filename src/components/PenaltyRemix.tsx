import { Camera, CircleDot, RotateCcw, Sparkles, Zap } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { playFootballCue, playOutcomeCues } from '../audio/footballAudio'
import { pickFootballOutcome } from '../engine/footballOutcomes'
import { randomSeed } from '../engine/random'
import type { ClipPhase, PlayableMomentScenario, TimelineEnergy, TimelineOutcome } from '../engine/types'
import { getScenario } from '../scenarios/footballMoments'
import { captureTimeline, getTimelineLabel } from '../share/timelineShare'

function getBallFlightStyle(outcome: TimelineOutcome, ballStart: { x: number; y: number }) {
  const midX = (ballStart.x + outcome.target.x) / 2 + outcome.curve * 0.22
  const verticalLift =
    outcome.flight === 'sky' ? 34 : outcome.flight === 'panenka' ? 25 : outcome.flight === 'curl' ? 18 : outcome.flight === 'rising' ? 14 : 8
  const midY = Math.min(ballStart.y, outcome.target.y) - verticalLift
  const endScale = outcome.flight === 'sky' ? 0.28 : outcome.impact === 'save' ? 0.52 : 0.36
  const blur = outcome.flight === 'driven' ? 1.8 : 1.1

  return {
    '--start-x': `${ballStart.x}%`,
    '--start-y': `${ballStart.y}%`,
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

function RealisticBallFlight({ outcome, ballStart }: { outcome: TimelineOutcome; ballStart: { x: number; y: number } }) {
  return (
    <div className={`ball-flight effect-${outcome.effect} flight-${outcome.flight}`} style={getBallFlightStyle(outcome, ballStart)}>
      <span className="ball-shadow" />
      <span className="ball-trail" />
      <span className="soccer-ball" aria-hidden>
        <i className="ball-highlight" />
        <i className="ball-stitch stitch-a" />
        <i className="ball-stitch stitch-b" />
        <i className="panel panel-a" />
        <i className="panel panel-b" />
        <i className="panel panel-c" />
        <i className="panel panel-d" />
        <i className="panel panel-e" />
      </span>
    </div>
  )
}

function ActionShock({ outcome }: { outcome: TimelineOutcome }) {
  return (
    <div className={`action-shock shock-${outcome.effect}`} aria-hidden>
      <span className="shock-flash" />
      <span className="shock-speedline line-one" />
      <span className="shock-speedline line-two" />
      <span className="shock-speedline line-three" />
      <span className="crowd-surge" />
    </div>
  )
}

function KeeperReplacementMask() {
  return (
    <div className="keeper-replacement-mask" aria-hidden>
      <span className="mask-soft-erase" />
      <span className="mask-keeper-fill" />
      <span className="mask-limb mask-arm-left" />
      <span className="mask-limb mask-arm-right" />
      <span className="mask-limb mask-leg-left" />
      <span className="mask-limb mask-leg-right" />
      <span className="mask-net net-v1" />
      <span className="mask-net net-v2" />
      <span className="mask-net net-v3" />
      <span className="mask-net net-h1" />
      <span className="mask-net net-h2" />
    </div>
  )
}

function KeeperReaction({ outcome }: { outcome: TimelineOutcome }) {
  return (
    <div className={`keeper-reaction dive-${outcome.keeperDive} effect-${outcome.effect}`} aria-hidden>
      <span className="keeper-dive-trail" />
      <span className="keeper-reach-line" />
      <svg className="keeper-svg" viewBox="0 0 100 170" role="presentation">
        <ellipse className="keeper-ground-shadow" cx="50" cy="158" rx="25" ry="7" />
        <g className="keeper-human">
          <path className="keeper-limb keeper-leg-left" d="M43 90 C37 104 31 124 25 151" />
          <path className="keeper-limb keeper-leg-right" d="M58 90 C65 107 70 126 76 150" />
          <path className="keeper-boot" d="M17 151 L31 151 L31 158 L14 159 Z" />
          <path className="keeper-boot" d="M70 149 L84 151 L88 158 L72 158 Z" />
          <path className="keeper-limb keeper-arm-left" d="M38 48 C27 60 18 76 11 97" />
          <path className="keeper-limb keeper-arm-right" d="M62 48 C74 62 83 78 91 99" />
          <circle className="keeper-real-glove" cx="10" cy="99" r="7" />
          <circle className="keeper-real-glove" cx="92" cy="100" r="7" />
          <path className="keeper-shorts" d="M37 82 L63 82 L68 101 L55 104 L50 91 L44 104 L31 101 Z" />
          <path className="keeper-torso" d="M36 38 C43 33 57 33 65 39 L68 79 C61 87 42 87 34 80 Z" />
          <path className="keeper-torso-light" d="M43 39 C50 36 58 37 63 41 L62 58 C55 54 48 51 40 50 Z" />
          <circle className="keeper-neck" cx="50" cy="36" r="5" />
          <circle className="keeper-face" cx="50" cy="24" r="11" />
          <path className="keeper-hair" d="M39 23 C41 12 56 10 62 21 C55 17 47 18 39 23 Z" />
        </g>
      </svg>
    </div>
  )
}

function GoalImpact({ outcome }: { outcome: TimelineOutcome }) {
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

function FanIntervention() {
  return (
    <div className="fan-intervention" aria-hidden>
      <span className="fan-entry-burst" />
      <span className="fan-runner">
        <i className="fan-shadow" />
        <i className="fan-head" />
        <i className="fan-torso" />
        <i className="fan-arm fan-arm-left" />
        <i className="fan-arm fan-arm-right" />
        <i className="fan-leg fan-leg-left" />
        <i className="fan-leg fan-leg-right" />
      </span>
      <span className="fan-kick-flash" />
      <span className="fan-caption">FAN TAKES THE SHOT</span>
    </div>
  )
}

export function PenaltyRemix({ scenario = getScenario() }: { scenario?: PlayableMomentScenario }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [phase, setPhase] = useState<ClipPhase>('ready')
  const [energy, setEnergy] = useState<TimelineEnergy | null>(null)
  const [meter, setMeter] = useState(0)
  const [outcome, setOutcome] = useState<TimelineOutcome | null>(null)
  const [timelineId, setTimelineId] = useState('')
  const animationRef = useRef<number | null>(null)

  const source = `${import.meta.env.BASE_URL}${scenario.baseVideo}`
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

  async function start() {
    setPhase('setup')
    setEnergy(null)
    setOutcome(null)
    setTimelineId('')
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    video.playbackRate = 1
    playFootballCue('whistle')
    await video.play()
  }

  function onTimeUpdate() {
    const video = videoRef.current
    if (!video || phase !== 'setup') return
    if (video.currentTime >= scenario.decisionTime) {
      video.pause()
      video.currentTime = scenario.decisionTime
      setPhase('choose')
    }
  }

  function choose(nextEnergy: TimelineEnergy) {
    setEnergy(nextEnergy)
    setPhase('timing')
    playFootballCue('tension')
  }

  function kick() {
    if (!energy) return
    const seed = randomSeed()
    const nextOutcome = pickFootballOutcome(scenario, energy, meter, seed)
    setTimelineId(getTimelineLabel(seed))
    setOutcome(nextOutcome)
    setPhase('result')
    playFootballCue('kick')
    playOutcomeCues(nextOutcome.effect === 'fan' ? 'chaos' : nextOutcome.effect === 'portal' ? 'portal' : 'crowd', nextOutcome.impact)
  }

  return (
    <main className={`penalty-lab phase-${phase} ${outcome ? `outcome-${outcome.effect} impact-${outcome.impact}` : ''}`}>
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
            <span>{scenario.eyebrow}</span>
            <h1>{scenario.title}</h1>
            <p>{scenario.description}</p>
            <button type="button" onClick={start}>
              <CircleDot size={18} />
              {scenario.readyCta}
            </button>
          </div>
        )}

        {phase === 'setup' && (
          <div className="timeline-banner">
            <span>ORIGINAL TIMELINE PLAYING</span>
            <strong>{scenario.setupLabel}</strong>
          </div>
        )}

        {phase === 'choose' && (
          <div className="penalty-card energy-card">
            <span>REALITY PAUSED</span>
            <h2>{scenario.choosePrompt}</h2>
            <div className="energy-grid">
              {(Object.keys(scenario.energyCopy) as TimelineEnergy[]).map((key) => (
                <button key={key} type="button" className={`energy-choice energy-${key}`} onClick={() => choose(key)}>
                  <em>{scenario.energyCopy[key].kicker}</em>
                  <strong>{scenario.energyCopy[key].title}</strong>
                  <small>{scenario.energyCopy[key].description}</small>
                  <i aria-hidden />
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'timing' && (
          <button type="button" className={`kick-zone timing-${energy ?? 'normal'}`} onClick={kick}>
            <div className="kick-meta">
              <span>{scenario.timingCta}</span>
              {energy && <strong>{scenario.energyCopy[energy].title} timeline armed</strong>}
            </div>
            <div className="timing-track">
              <em className="bad-zone left-zone">EARLY</em>
              <i style={{ left: `${meter * 100}%` }} />
              <b />
              <em className="bad-zone right-zone">LATE</em>
            </div>
            <div className="kick-feedback">
              <small>{meterScore < 0.08 ? 'Perfect strike window' : meterScore < 0.18 ? 'Good contact' : 'Hold nerve'}</small>
              <small>{Math.round((1 - Math.min(1, meterScore * 2)) * 100)}% control</small>
            </div>
          </button>
        )}

        {outcome && (
          <>
            <ActionShock outcome={outcome} />
            {outcome.effect === 'fan' && <FanIntervention />}
            <KeeperReplacementMask />
            <KeeperReaction outcome={outcome} />
            <RealisticBallFlight outcome={outcome} ballStart={scenario.markers.ballStart} />
            <GoalImpact outcome={outcome} />
          </>
        )}

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
              <button type="button" onClick={() => void captureTimeline(scenario, outcome, timelineId)}>
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
