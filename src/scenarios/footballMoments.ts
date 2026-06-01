import type { PlayableMomentScenario } from '../engine/types'

export const footballMomentScenarios: PlayableMomentScenario[] = [
  {
    id: 'penalty-timeline-remix',
    title: 'Rewrite the penalty timeline.',
    eyebrow: 'PLAYABLE NEWS LAB',
    description: 'Real footage as the base layer. You choose the timeline energy, tap the kick, and the moment branches into a new reality.',
    template: 'spot-kick',
    baseVideo: 'footage/source-web.mp4',
    decisionTime: 3.05,
    setupLabel: 'Decision window incoming',
    readyCta: 'Start remix',
    choosePrompt: 'Choose timeline energy',
    timingCta: 'Tap to kick',
    resultShareTitle: 'Penalty Timeline Remix',
    markers: {
      ballStart: { x: 42.4, y: 70.8 },
      goal: { x: 27, y: 22, width: 46, height: 19 },
    },
    energyCopy: {
      normal: { title: 'Normal', kicker: 'Canon-safe', description: 'Reality stays mostly legal.' },
      hero: { title: 'Hero', kicker: 'Top bins', description: 'Bias toward cinematic redemption.' },
      chaos: { title: 'Chaos', kicker: 'Viral mode', description: 'The internet enters the pitch.' },
      cursed: { title: 'Cursed', kicker: 'VAR glitch', description: 'Forbidden doors open.' },
    },
  },
]

export function getScenario(id?: string | null) {
  return footballMomentScenarios.find((scenario) => scenario.id === id) ?? footballMomentScenarios[0]
}
