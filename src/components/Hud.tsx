import { AlertTriangle, CheckCircle2, Circle, Coffee, Gauge, Map, Play, Timer, Volume2, VolumeX } from 'lucide-react'
import { FINISH_Z, useGameStore } from '../game/store'

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function Hud() {
  const {
    timeLeft,
    stress,
    status,
    stage,
    speed,
    distance,
    score,
    combo,
    collisions,
    message,
    routePhase,
    cleanStreak,
    hasChild,
    objectives,
    bestScore,
    soundEnabled,
    start,
    toggleSound,
  } = useGameStore()
  const markerPosition = Math.max(8, Math.min(92, distance * 100))
  const mood = Math.max(0, 100 - Math.round(stress))
  const objectiveRows =
    stage === 'nursery'
      ? ([
          ['reachNursery', 'Enter the scenic cafe', objectives.reachNursery],
          ['grabChild', 'Order two good coffees', objectives.grabChild],
          ['escapeNursery', 'Return to the car', objectives.escapeNursery],
        ] as const)
      : ([
          ['survive', 'Cruise Thong Lor cafe row', objectives.survive],
          ['dodgeConcrete', 'Avoid bad traffic choices', objectives.dodgeConcrete],
          ['exitReady', 'Find parking before the good table is gone', objectives.exitReady],
          ['reachNursery', 'Reach the scenic cafe before time runs out', objectives.reachNursery],
        ] as const)

  return (
    <section className="hud-layer" aria-label="Game status">
      <div className="mission-panel glass-panel">
        <div className="panel-title">
          <AlertTriangle size={15} />
          MAIN MISSION
        </div>
        <h1>{stage === 'nursery' ? 'Cafe Stop' : 'Find Scenic Coffee'}</h1>
        <ul>
          {objectiveRows.map((row) => (
            <li key={row[0]} className={row[2] ? 'objective-complete' : ''}>
              {row[2] ? <CheckCircle2 size={15} /> : <Circle size={15} />}
              <span>{row[1]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="new-mission glass-panel">
        <span>{stage === 'nursery' ? 'FINAL STOP FOUND' : 'NEW COFFEE MISSION'}</span>
        <strong>{stage === 'nursery' ? 'Order the coffee and enjoy the view' : 'Find a scenic Thong Lor cafe with actually good coffee'}</strong>
      </div>

      <div className="timer-panel glass-panel">
        <div>
          <span className="small-label">
            <Timer size={14} />
            TIME LEFT
          </span>
          <strong>{formatTime(timeLeft)}</strong>
        </div>
        <div>
          <span className="small-label">COFFEE BUDGET</span>
          <strong>&#3647;500 / 2 CUPS</strong>
        </div>
      </div>

      <div className="minimap glass-panel">
        <div className="panel-title">
          <Map size={15} />
          {stage === 'nursery' ? 'CAFE FLOORPLAN' : 'THONG LOR CAFE MAP'}
        </div>
        <div className="map-road">
          <span style={{ left: `${markerPosition}%` }} className="taxi-dot" />
          <span className="finish-dot">
            <Coffee size={14} />
          </span>
        </div>
        <div className="map-meta">
          <span>{stage === 'nursery' ? (hasChild ? 'coffee secured' : 'find table') : `${Math.round(speed * 4.2)} km/h`}</span>
          <span>
            {Math.round(distance * FINISH_Z)} m / {FINISH_Z} m
          </span>
        </div>
      </div>

      <div className="drive-readout glass-panel">
        <span>{routePhase}</span>
        <strong>{score.toLocaleString()} pts</strong>
        <small>
          {message} &middot; {combo.toFixed(2)}x &middot; clean {cleanStreak.toFixed(1)}s &middot; {collisions} hits
        </small>
      </div>

      {stage === 'nursery' && status === 'running' && (
        <div className="meme-caption">
          <strong>{hasChild ? 'Coffee date secured' : 'Walking into the cafe before the queue'}</strong>
        </div>
      )}

      <div className="stress-wrap">
        <div className="stress-label">
          <span>
            <Gauge size={16} />
            CAFE MOOD
          </span>
          <strong>{mood}%</strong>
        </div>
        <div className="stress-track">
          <span style={{ width: `${mood}%` }} />
        </div>
      </div>

      {status !== 'running' && status !== 'ready' && (
        <div className={`end-state ${status}`}>
          <div className="end-card glass-panel">
            <span>{status === 'won' ? 'CAFE FOUND' : 'COFFEE RUN FAILED'}</span>
            <h2>{status === 'won' ? 'Good coffee secured.' : stress >= 100 ? 'Traffic mood ruined.' : 'The good table is gone.'}</h2>
            <p>
              {status === 'won'
                ? `Score ${score.toLocaleString()} - ${collisions} hits - ${formatTime(timeLeft)} left.`
                : `Score ${score.toLocaleString()} - ${collisions} hits - best ${bestScore.toLocaleString()}.`}
            </p>
            <button type="button" onClick={start}>
              Run it again
            </button>
          </div>
        </div>
      )}

      {status === 'ready' && (
        <div className="start-state">
          <div className="start-card glass-panel">
            <span>THONG LOR: CAFE RUN</span>
            <h2>Find a scenic cafe with good coffee.</h2>
            <p>Sunny Sukhumvit. A glacier-blue EV. Condos, cafes, bikes, brake lights, and one perfect coffee spot. Smooth driving builds score, bad traffic builds stress.</p>
            <div className="start-actions">
              <button type="button" onClick={start}>
                <Play size={18} />
                Start mission
              </button>
              <button type="button" onClick={toggleSound}>
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                {soundEnabled ? 'Sound on' : 'Sound off'}
              </button>
            </div>
            <small>WASD / arrows drive - Space brakes - R restarts</small>
          </div>
        </div>
      )}
    </section>
  )
}
