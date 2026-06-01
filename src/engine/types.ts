export type ClipPhase = 'ready' | 'setup' | 'choose' | 'timing' | 'result'

export type TimelineEnergy = 'normal' | 'hero' | 'chaos' | 'cursed'

export type MomentTemplateId = 'spot-kick'

export type TimelineOutcome = {
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

export type TimelineEnergyCopy = {
  title: string
  kicker: string
  description: string
}

export type MomentMarkers = {
  ballStart: { x: number; y: number }
  goal: { x: number; y: number; width: number; height: number }
}

export type PlayableMomentScenario = {
  id: string
  title: string
  eyebrow: string
  description: string
  template: MomentTemplateId
  baseVideo: string
  decisionTime: number
  setupLabel: string
  readyCta: string
  choosePrompt: string
  timingCta: string
  resultShareTitle: string
  markers: MomentMarkers
  energyCopy: Record<TimelineEnergy, TimelineEnergyCopy>
}
