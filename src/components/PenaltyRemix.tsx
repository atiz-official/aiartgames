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

function KeeperReaction({ outcome }: { outcome: TimelineOutcome }) {
  return (
    <div className={`keeper-reaction dive-${outcome.keeperDive} effect-${outcome.effect}`} aria-hidden>
      <span className="keeper-afterimage after-a" />
      <span className="keeper-afterimage after-b" />
      <span className="keeper-dive-trail" />
      <span className="keeper-reach-line" />
      <span className="keeper-shadow" />
      <span className="keeper-head" />
      <span className="keeper-glove glove-left" />
      <span className="keeper-glove glove-right" />
      <span className="keeper-arm arm-left" />
      <span className="keeper-arm arm-right" />
      <span className="keeper-shoulders" />
      <span className="keeper-body" />
      <span className="keeper-leg leg-left" />
      <span className="keeper-leg leg-right" />
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
