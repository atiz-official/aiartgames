const lanes: Array<-1 | 0 | 1> = [-1, 0, 1]

export const traffic = Array.from({ length: 18 }, (_, index) => ({
  id: `traffic-${index}`,
  lane: lanes[(index * 11) % lanes.length],
  z: 44 + index * 46,
  color: index % 5 === 0 ? '#f4f1e8' : index % 5 === 1 ? '#2b3136' : index % 5 === 2 ? '#8b2432' : index % 5 === 3 ? '#7d9eb0' : '#b69363',
  length: index % 6 === 0 ? 6.2 : index % 4 === 0 ? 4.7 : 4.15,
  speed: index % 6 === 0 ? 3.2 : 5.2 + (index % 4),
}))
