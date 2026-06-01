import type { PlayableMomentScenario, TimelineOutcome } from '../engine/types'

export function getTimelineLabel(seed: number) {
  return `#${seed.toString(16).toUpperCase()}`
}

export async function captureTimeline(scenario: PlayableMomentScenario, outcome: TimelineOutcome, timelineId: string) {
  const text = `${scenario.resultShareTitle}: ${outcome.label} ${timelineId}`
  if (navigator.share) {
    await navigator.share({
      title: scenario.resultShareTitle,
      text,
      url: window.location.href,
    })
    return
  }

  await navigator.clipboard?.writeText(`${text} ${window.location.href}`)
}
