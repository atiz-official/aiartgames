export type ObstacleKind = 'car' | 'truck' | 'cone' | 'barrier' | 'deliveryBike' | 'valetStand'

export type Obstacle = {
  id: string
  kind: ObstacleKind
  lane: -1 | 0 | 1
  z: number
  xOffset?: number
}

const lanes: Array<-1 | 0 | 1> = [-1, 0, 1]
const kinds: ObstacleKind[] = ['car', 'truck', 'cone', 'barrier', 'deliveryBike', 'valetStand']

export const obstacles: Obstacle[] = Array.from({ length: 34 }, (_, index) => {
  const lane = lanes[(index * 7 + 1) % lanes.length]
  const kind = kinds[(index * 5 + 2) % kinds.length]

  return {
    id: `hazard-${index}`,
    kind,
    lane,
    z: 66 + index * 24 + ((index % 5) - 2) * 2.25,
    xOffset: index % 6 === 0 ? 1.25 : index % 7 === 0 ? -1.25 : kind === 'valetStand' ? 1.8 : 0,
  }
})

export const traffic = Array.from({ length: 28 }, (_, index) => ({
  id: `traffic-${index}`,
  lane: lanes[(index * 11) % lanes.length],
  z: 26 + index * 28,
  color: index % 5 === 0 ? '#f4f1e8' : index % 5 === 1 ? '#2b3136' : index % 5 === 2 ? '#8b2432' : index % 5 === 3 ? '#7d9eb0' : '#b69363',
  length: index % 6 === 0 ? 6.2 : index % 4 === 0 ? 4.7 : 4.15,
  speed: index % 6 === 0 ? 2.5 : 4.2 + (index % 4),
}))
