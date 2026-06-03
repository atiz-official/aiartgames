import type { TimelineOutcome } from '../engine/types'

export type CommentaryClip = {
  id: string
  url: string
  caption: string
  delay: number
  volume: number
}

const VOICE_BASE_URL = `${import.meta.env.BASE_URL}audio/commentary`

const COMMENTARY_LINES: Record<string, { main: string; followup: string }> = {
  'fan-steals-kick': {
    main: 'Wait wait! That is not the taker! A fan has taken the shot!',
    followup: 'The stadium has lost its mind. This timeline is officially absurd.',
  },
  'var-portal': {
    main: 'The ball has disappeared! VAR is checking which universe owns it!',
    followup: 'Nobody knows if this is a goal, a glitch, or evidence.',
  },
  'top-bins': {
    main: 'Top corner! That is not a goal, that is a rewritten memory!',
    followup: 'Clip that. This is the version people will argue about tomorrow.',
  },
  goal: {
    main: 'It is in! Clean timeline, pure pressure release!',
    followup: 'The crowd erupts, the camera shakes, and the timeline locks in.',
  },
  post: {
    main: 'Off the post! One inch from rewriting the group chat!',
    followup: 'Listen to that silence. One inch just changed the whole night.',
  },
  saved: {
    main: 'Saved! The keeper read the future and slapped it away!',
    followup: 'That reaction is why this moment still hurts.',
  },
  sky: {
    main: 'Oh no! That ball may need a visa to come back down!',
    followup: 'The stadium cannot decide whether to laugh or cry.',
  },
}

export function preloadCommentaryVoicePack() {
  Object.keys(COMMENTARY_LINES).forEach((outcomeId) => {
    ;['main', 'followup'].forEach((role) => {
      const audio = new Audio(`${VOICE_BASE_URL}/${outcomeId}-${role}.wav`)
      audio.preload = 'auto'
      audio.load()
    })
  })
}

export function getOutcomeFollowUpLine(outcome: TimelineOutcome) {
  return COMMENTARY_LINES[outcome.id]?.followup ?? 'The crowd erupts, the camera shakes, and the timeline locks in.'
}

export function getOutcomeCommentaryClips(outcome: TimelineOutcome): CommentaryClip[] {
  const lines = COMMENTARY_LINES[outcome.id]
  if (!lines) return []

  return [
    {
      id: `${outcome.id}-main`,
      url: `${VOICE_BASE_URL}/${outcome.id}-main.wav`,
      caption: lines.main,
      delay: 940,
      volume: outcome.commentaryStyle === 'dead-air' ? 0.74 : 0.92,
    },
    {
      id: `${outcome.id}-followup`,
      url: `${VOICE_BASE_URL}/${outcome.id}-followup.wav`,
      caption: lines.followup,
      delay: 2600,
      volume: outcome.commentaryStyle === 'dead-air' ? 0.68 : 0.84,
    },
  ]
}
