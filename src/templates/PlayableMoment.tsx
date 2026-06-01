import type { PlayableMomentScenario } from '../engine/types'
import { getScenario } from '../scenarios/footballMoments'
import { SpotKickTemplate } from './SpotKickTemplate'

type PlayableMomentProps = {
  scenario?: PlayableMomentScenario
}

export function PlayableMoment({ scenario = getScenario() }: PlayableMomentProps) {
  switch (scenario.template) {
    case 'spot-kick':
      return <SpotKickTemplate scenario={scenario} />
    default:
      return <SpotKickTemplate scenario={scenario} />
  }
}
