import { Camera, CircleDot, RotateCcw, Sparkles, Video, Zap } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { playFootballCue, playOutcomeCues } from '../audio/footballAudio'
import { pickFootballOutcome } from '../engine/footballOutcomes'
import { randomSeed } from '../engine/random'
import type { ClipPhase, PlayableMomentScenario, TimelineEnergy, TimelineOutcome } from '../engine/types'
import { getScenario } from '../scenarios/footballMoments'
import { captureTimeline, exportTimelineClip, getTimelineLabel } from '../share/timelineShare'

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
        <defs>
          <linearGradient id="keeperKit" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#3f775c" />
            <stop offset="46%" stopColor="#245941" />
            <stop offset="100%" stopColor="#112f25" />
          </linearGradient>
          <linearGradient id="keeperSkin" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#d1a07b" />
            <stop offset="62%" stopColor="#9d6746" />
            <stop offset="100%" stopColor="#704634" />
          </linearGradient>
          <linearGradient id="keeperFabricDark" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#213948" />
            <stop offset="100%" stopColor="#0c171f" />
          </linearGradient>
        </defs>
        <ellipse className="keeper-ground-shadow" cx="50" cy="158" rx="25" ry="7" />
        <g className="keeper-human">
          <path className="keeper-leg-shape leg-shape-left" d="M39 91 C36 105 30 128 23 151 L34 152 C39 130 45 109 49 94 Z" />
          <path className="keeper-leg-shape leg-shape-right" d="M57 93 C63 110 70 130 75 151 L86 151 C79 126 72 105 63 90 Z" />
          <path className="keeper-leg-highlight leg-highlight-left" d="M41 96 C38 112 34 130 31 147" />
          <path className="keeper-leg-highlight leg-highlight-right" d="M62 98 C69 117 74 132 78 148" />
          <path className="keeper-boot" d="M16 150 L34 151 L34 158 L12 159 Z" />
          <path className="keeper-boot" d="M70 148 L86 151 L91 158 L71 158 Z" />
          <path className="keeper-arm-shape arm-shape-left" d="M39 45 C29 58 19 76 9 96 L18 101 C27 82 35 66 46 53 Z" />
          <path className="keeper-arm-shape arm-shape-right" d="M61 45 C73 60 84 80 91 100 L99 95 C91 73 82 57 67 47 Z" />
          <path className="keeper-arm-highlight arm-highlight-left" d="M35 56 C26 69 21 81 15 94" />
          <path className="keeper-arm-highlight arm-highlight-right" d="M70 57 C79 70 85 82 92 95" />
          <circle className="keeper-real-glove" cx="10" cy="99" r="7" />
          <circle className="keeper-real-glove" cx="92" cy="100" r="7" />
          <path className="keeper-shorts" d="M37 82 L63 82 L68 101 L55 104 L50 91 L44 104 L31 101 Z" />
          <path className="keeper-torso" d="M35 38 C42 31 58 31 66 39 C70 52 70 68 67 81 C60 89 42 89 34 80 C32 65 32 51 35 38 Z" />
          <path className="keeper-chest-shadow" d="M38 43 C48 51 58 59 65 77 C59 83 46 85 38 78 Z" />
          <path className="keeper-torso-light" d="M41 39 C49 35 59 36 64 42 L62 57 C55 53 48 50 39 50 Z" />
          <path className="keeper-jersey-fold fold-a" d="M44 43 C43 56 43 68 45 82" />
          <path className="keeper-jersey-fold fold-b" d="M57 42 C58 55 57 67 55 82" />
          <circle className="keeper-neck" cx="50" cy="36" r="5" />
          <path className="keeper-face" d="M39 23 C39 15 44 10 51 10 C59 10 64 16 63 24 C62 33 57 39 50 39 C43 38 39 32 39 23 Z" />
          <path className="keeper-hair" d="M39 23 C41 12 56 10 62 21 C55 17 47 18 39 23 Z" />
          <path className="keeper-face-shadow" d="M53 16 C61 20 60 33 52 37 C56 29 56 22 53 16 Z" />
          <path className="keeper-brow" d="M43 23 C47 21 53 21 57 23" />
          <circle className="keeper-eye eye-left" cx="46" cy="25" r="1.1" />
          <circle className="keeper-eye eye-right" cx="54" cy="25" r="1.1" />
          <path className="keeper-nose" d="M50 25 L48 31 L52 31" />
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

function FanIntervention({ source, cloneTime }: { source: string; cloneTime: number }) {
  return (
    <div className="fan-intervention" aria-hidden>
      <span className="fan-entry-burst" />
      <span className="fan-video-clone">
        <video
          src={source}
          muted
          playsInline
          autoPlay
          loop
          onLoadedMetadata={(event) => {
            event.currentTarget.currentTime = Math.max(0, cloneTime - 0.42)
            void event.currentTarget.play().catch(() => undefined)
          }}
        />
      </span>
      <span className="fan-runner">
        <i className="fan-motion-smear" />
        <svg className="fan-svg" viewBox="0 0 120 210" role="presentation">
          <defs>
            <linearGradient id="fanSkin" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#d4a17b" />
              <stop offset="68%" stopColor="#9a6848" />
              <stop offset="100%" stopColor="#6f4735" />
            </linearGradient>
            <linearGradient id="fanShirt" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#f4f0e6" />
              <stop offset="72%" stopColor="#d3d1c8" />
              <stop offset="100%" stopColor="#8e948e" />
            </linearGradient>
            <linearGradient id="fanRedStripe" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#bb2838" />
              <stop offset="100%" stopColor="#63131d" />
            </linearGradient>
          </defs>
          <ellipse className="fan-shadow" cx="58" cy="195" rx="38" ry="8" />
          <g className="fan-human">
            <path className="fan-leg-shape fan-leg-back" d="M54 111 C48 133 39 158 31 190 L44 192 C53 164 61 137 65 115 Z" />
            <path className="fan-leg-shape fan-leg-front" d="M68 111 C79 134 91 158 103 186 L113 180 C101 151 90 128 77 106 Z" />
            <path className="fan-shoe" d="M22 188 L45 190 L45 199 L18 199 Z" />
            <path className="fan-shoe" d="M97 181 L116 174 L121 182 L104 193 Z" />
            <path className="fan-arm-shape fan-arm-back" d="M49 52 C38 70 30 91 22 116 L33 120 C41 96 49 75 58 59 Z" />
            <path className="fan-arm-shape fan-arm-front" d="M75 52 C92 66 105 81 116 100 L109 110 C96 91 84 76 68 62 Z" />
            <path className="fan-shorts" d="M45 98 L76 97 L83 121 L66 124 L61 108 L51 126 L35 121 Z" />
            <path className="fan-torso-real" d="M42 40 C51 33 68 33 78 42 C83 61 83 81 76 99 C66 106 49 106 39 98 C35 78 35 58 42 40 Z" />
            <path className="fan-red-stripe" d="M56 36 L66 36 L68 101 L57 104 Z" />
            <path className="fan-shirt-shadow" d="M45 45 C58 56 70 73 76 96 C67 103 54 104 44 96 Z" />
            <path className="fan-shirt-fold fold-left" d="M48 48 C46 68 47 84 51 100" />
            <path className="fan-shirt-fold fold-right" d="M72 48 C74 68 72 84 69 100" />
            <circle className="fan-neck-real" cx="61" cy="37" r="6" />
            <path className="fan-face-real" d="M49 23 C49 13 56 7 64 8 C73 9 79 16 78 26 C77 36 70 43 61 42 C53 41 49 34 49 23 Z" />
            <path className="fan-hair-real" d="M49 24 C49 10 68 4 78 20 C69 15 58 16 49 24 Z" />
            <path className="fan-face-shade" d="M66 13 C76 18 75 35 64 41 C70 31 70 21 66 13 Z" />
            <circle className="fan-eye eye-left" cx="58" cy="26" r="1.2" />
            <circle className="fan-eye eye-right" cx="67" cy="26" r="1.2" />
            <path className="fan-nose" d="M63 27 L60 34 L65 34" />
          </g>
        </svg>
      </span>
      <i className="fan-boot-strike" />
      <span className="fan-kick-flash" />
      <span className="fan-caption">FAN TAKES THE SHOT</span>
    </div>
  )
}

function TimelineAtmosphere({ outcome }: { outcome: TimelineOutcome }) {
  return (
    <div
      className={`timeline-atmosphere crowd-${outcome.crowdBed} keeper-react-${outcome.keeperReaction} player-react-${outcome.playerReaction}`}
      aria-hidden
    >
      <span className="crowd-sign sign-primary">{outcome.crowdSign}</span>
      <span className="crowd-sign sign-secondary">{outcome.rarityTier.toUpperCase()} PULL</span>
      <span className="phone-lights lights-a" />
      <span className="phone-lights lights-b" />
      <span className="keeper-emote">
        <i className="keeper-emote-head" />
        <i className="keeper-emote-body" />
        <i className="keeper-emote-arm arm-a" />
        <i className="keeper-emote-arm arm-b" />
      </span>
      <span className="player-emote">
        <i className="player-emote-head" />
        <i className="player-emote-body" />
        <i className="player-emote-arm arm-a" />
        <i className="player-emote-arm arm-b" />
      </span>
      <span className="commentator-subtitle">{outcome.commentatorLine}</span>
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
  const [exportingClip, setExportingClip] = useState(false)
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

  useEffect(() => {
    if (phase !== 'setup') return

    const fallback = window.setTimeout(() => {
      const video = videoRef.current
      if (video && video.currentTime < scenario.decisionTime) {
        video.currentTime = scenario.decisionTime
      }
      video?.pause()
      setPhase('choose')
    }, scenario.decisionTime * 1000 + 650)

    return () => window.clearTimeout(fallback)
  }, [phase, scenario.decisionTime])

  async function start() {
    setPhase('setup')
    setEnergy(null)
    setOutcome(null)
    setTimelineId('')
    setExportingClip(false)
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    video.playbackRate = 1
    playFootballCue('whistle')
    await video.play().catch(() => undefined)
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
    playOutcomeCues(nextOutcome)
  }

  async function saveShareClip(nextOutcome: TimelineOutcome) {
    setExportingClip(true)
    try {
      await exportTimelineClip(source, scenario, nextOutcome, timelineId)
    } finally {
      setExportingClip(false)
    }
  }

  return (
    <main
      className={`penalty-lab phase-${phase} ${
        outcome ? `outcome-${outcome.effect} impact-${outcome.impact} camera-${outcome.cameraTreatment} rarity-${outcome.rarityTier}` : ''
      }`}
    >
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
            <TimelineAtmosphere outcome={outcome} />
            {outcome.effect === 'fan' && <FanIntervention source={source} cloneTime={scenario.decisionTime} />}
            <KeeperReplacementMask />
            <KeeperReaction outcome={outcome} />
            <RealisticBallFlight outcome={outcome} ballStart={scenario.markers.ballStart} />
            <GoalImpact outcome={outcome} />
          </>
        )}

        {outcome?.effect === 'portal' && <div className="var-portal">VAR PORTAL</div>}

        {phase === 'result' && outcome && (
          <div className="result-slab">
            <span>{timelineId} - {outcome.rarity} - {outcome.odds}</span>
            <h2>{outcome.label}</h2>
            <p>{outcome.caption}</p>
            <div className="timeline-beats" aria-label="Timeline beats">
              {outcome.beats.map((beat) => (
                <small key={beat}>{beat}</small>
              ))}
            </div>
            <div className="result-actions">
              <button type="button" onClick={start}>
                <RotateCcw size={16} />
                New timeline
              </button>
              <button type="button" onClick={() => void saveShareClip(outcome)} disabled={exportingClip}>
                <Video size={16} />
                {exportingClip ? 'Making clip' : 'Save clip'}
              </button>
              <button type="button" onClick={() => void captureTimeline(scenario, outcome, timelineId)}>
                <Camera size={16} />
                Share link
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
