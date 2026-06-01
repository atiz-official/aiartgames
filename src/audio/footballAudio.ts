type FootballCue = 'whistle' | 'kick' | 'crowd' | 'portal'

export function playFootballCue(kind: FootballCue) {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return
  const context = new AudioContextClass()
  const gain = context.createGain()
  gain.connect(context.destination)
  gain.gain.value = kind === 'crowd' ? 0.05 : 0.1
  const osc = context.createOscillator()
  osc.connect(gain)
  osc.type = kind === 'portal' ? 'sawtooth' : 'sine'
  osc.frequency.value = kind === 'whistle' ? 1250 : kind === 'kick' ? 95 : kind === 'portal' ? 180 : 260
  osc.start()
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + (kind === 'crowd' ? 1.2 : 0.28))
  osc.stop(context.currentTime + (kind === 'crowd' ? 1.2 : 0.28))
}
