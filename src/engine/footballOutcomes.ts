import type { PlayableMomentScenario, TimelineEnergy, TimelineOutcome } from './types'
import { seeded } from './random'

export function pickFootballOutcome(scenario: PlayableMomentScenario, energy: TimelineEnergy, timing: number, seed: number): TimelineOutcome {
  switch (scenario.template) {
    case 'spot-kick':
      return pickSpotKickOutcome(energy, timing, seed)
    default:
      return pickSpotKickOutcome(energy, timing, seed)
  }
}

function pickSpotKickOutcome(energy: TimelineEnergy, timing: number, seed: number): TimelineOutcome {
  const rand = seeded(seed)
  const precision = 1 - Math.min(1, Math.abs(timing - 0.5) * 2)
  const luck = rand()
  const power = precision * 0.72 + luck * 0.28

  if (energy === 'chaos') {
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
