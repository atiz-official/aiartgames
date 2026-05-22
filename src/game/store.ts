import { create } from 'zustand'

export type GameStatus = 'ready' | 'running' | 'won' | 'lost'
export type GameStage = 'road' | 'nursery'

export type Objectives = {
  survive: boolean
  dodgeConcrete: boolean
  exitReady: boolean
  reachNursery: boolean
  grabChild: boolean
  escapeNursery: boolean
}

export type DriveControl = 'forward' | 'backward' | 'left' | 'right' | 'brake'
export type DriveControls = Record<DriveControl, boolean>

type GameState = {
  timeLeft: number
  stress: number
  status: GameStatus
  stage: GameStage
  speed: number
  distance: number
  score: number
  combo: number
  collisions: number
  message: string
  routePhase: string
  cleanStreak: number
  hasChild: boolean
  objectives: Objectives
  bestScore: number
  soundEnabled: boolean
  controls: DriveControls
  setTelemetry: (
    payload: Partial<
      Pick<
        GameState,
        | 'timeLeft'
        | 'stress'
        | 'status'
        | 'stage'
        | 'speed'
        | 'distance'
        | 'score'
        | 'combo'
        | 'collisions'
        | 'message'
        | 'routePhase'
        | 'cleanStreak'
        | 'hasChild'
        | 'objectives'
        | 'bestScore'
      >
    >,
  ) => void
  start: () => void
  toggleSound: () => void
  setControl: (control: DriveControl, active: boolean) => void
  clearControls: () => void
  enterNursery: () => void
  finishRun: () => void
  reset: () => void
}

export const RUN_SECONDS = 15 * 60
export const FINISH_Z = 840
const initialObjectives: Objectives = {
  survive: false,
  dodgeConcrete: false,
  exitReady: false,
  reachNursery: false,
  grabChild: false,
  escapeNursery: false,
}
const initialControls: DriveControls = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  brake: false,
}

export const useGameStore = create<GameState>((set) => ({
  timeLeft: RUN_SECONDS,
  stress: 12,
  status: 'ready',
  stage: 'road',
  speed: 0,
  distance: 0,
  score: 0,
  combo: 1,
  collisions: 0,
  message: 'Cafe list loaded.',
  routePhase: 'Coffee route briefing',
  cleanStreak: 0,
  hasChild: false,
  objectives: initialObjectives,
  bestScore: Number(window.localStorage.getItem('rama-ii-best-score') ?? 0),
  soundEnabled: true,
  controls: initialControls,
  setTelemetry: (payload) => set(payload),
  start: () =>
    set({
      timeLeft: RUN_SECONDS,
      stress: 12,
      status: 'running',
      stage: 'road',
      speed: 0,
      distance: 0,
      score: 0,
      combo: 1,
      collisions: 0,
      message: 'Find the cafe route.',
      routePhase: 'Thong Lo cafe row',
      cleanStreak: 0,
      hasChild: false,
      objectives: initialObjectives,
      controls: initialControls,
    }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setControl: (control, active) =>
    set((state) => ({
      controls: {
        ...state.controls,
        [control]: active,
      },
    })),
  clearControls: () => set({ controls: initialControls }),
  enterNursery: () =>
    set((state) => ({
      status: 'running',
      stage: 'nursery',
      speed: 0,
      distance: 1,
      routePhase: 'Scenic cafe found',
      message: 'Park up. Order the good coffee.',
      hasChild: false,
      combo: Math.max(1, state.combo),
      objectives: {
        ...state.objectives,
        reachNursery: true,
      },
      controls: initialControls,
    })),
  finishRun: () =>
    set((state) => {
      const finalScore = Math.round(state.score)
      const bestScore = Math.max(Number(window.localStorage.getItem('rama-ii-best-score') ?? 0), finalScore)
      window.localStorage.setItem('rama-ii-best-score', String(bestScore))
      return {
        status: 'won',
        stage: 'road',
        routePhase: 'Scenic cafe found',
        message: 'Coffee secured. Good view, good beans.',
        bestScore,
        objectives: {
          ...state.objectives,
          grabChild: true,
          escapeNursery: true,
        },
      }
    }),
  reset: () =>
    set({
      timeLeft: RUN_SECONDS,
      stress: 12,
      status: 'ready',
      stage: 'road',
      speed: 0,
      distance: 0,
      score: 0,
      combo: 1,
      collisions: 0,
      message: 'Cafe list loaded.',
      routePhase: 'Coffee route briefing',
      cleanStreak: 0,
      hasChild: false,
      objectives: initialObjectives,
      controls: initialControls,
    }),
}))
