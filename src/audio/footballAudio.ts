type FootballCue = 'whistle' | 'kick' | 'crowd' | 'portal' | 'tension' | 'net' | 'save' | 'post' | 'chaos'

type BrowserWindowWithAudio = typeof window & { webkitAudioContext?: typeof AudioContext }

let audioContext: AudioContext | null = null

function getAudioContext() {
  const AudioContextClass = window.AudioContext || (window as BrowserWindowWithAudio).webkitAudioContext
  if (!AudioContextClass) return null
  audioContext ??= new AudioContextClass()
  if (audioContext.state === 'suspended') void audioContext.resume()
  return audioContext
}

function envelope(gain: GainNode, start: number, peak: number, attack = 0.01, release = 0.35) {
  gain.gain.cancelScheduledValues(start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), start + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + release)
}

function tone(frequency: number, duration: number, options: { type?: OscillatorType; gain?: number; detune?: number; delay?: number } = {}) {
  const context = getAudioContext()
  if (!context) return
  const start = context.currentTime + (options.delay ?? 0)
  const osc = context.createOscillator()
  const gain = context.createGain()
  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = frequency > 600 ? 2200 : 420
  osc.type = options.type ?? 'sine'
  osc.frequency.setValueAtTime(frequency, start)
  if (options.detune) osc.detune.setValueAtTime(options.detune, start)
  osc.connect(filter)
  filter.connect(gain)
  gain.connect(context.destination)
  envelope(gain, start, options.gain ?? 0.08, 0.008, duration)
  osc.start(start)
  osc.stop(start + duration + 0.05)
}

function noise(duration: number, options: { gain?: number; delay?: number; lowpass?: number; highpass?: number } = {}) {
  const context = getAudioContext()
  if (!context) return
  const start = context.currentTime + (options.delay ?? 0)
  const frameCount = Math.max(1, Math.floor(context.sampleRate * duration))
  const buffer = context.createBuffer(1, frameCount, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frameCount; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frameCount)
  }
  const source = context.createBufferSource()
  const gain = context.createGain()
  const lowpass = context.createBiquadFilter()
  const highpass = context.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.value = options.lowpass ?? 2600
  highpass.type = 'highpass'
  highpass.frequency.value = options.highpass ?? 90
  source.buffer = buffer
  source.connect(highpass)
  highpass.connect(lowpass)
  lowpass.connect(gain)
  gain.connect(context.destination)
  envelope(gain, start, options.gain ?? 0.06, 0.02, duration)
  source.start(start)
  source.stop(start + duration + 0.05)
}

export function playFootballCue(kind: FootballCue) {
  if (kind === 'whistle') {
    tone(1440, 0.26, { gain: 0.12, type: 'square' })
    tone(1760, 0.18, { gain: 0.07, type: 'square', delay: 0.11 })
    return
  }

  if (kind === 'tension') {
    noise(1.8, { gain: 0.035, lowpass: 1200, highpass: 180 })
    tone(64, 1.6, { gain: 0.028, type: 'triangle' })
    tone(97, 1.2, { gain: 0.018, type: 'sine', delay: 0.16 })
    return
  }

  if (kind === 'kick') {
    tone(54, 0.32, { gain: 0.18, type: 'triangle' })
    tone(112, 0.16, { gain: 0.1, type: 'sawtooth', delay: 0.012 })
    noise(0.18, { gain: 0.06, lowpass: 900, highpass: 65 })
    return
  }

  if (kind === 'net') {
    noise(0.42, { gain: 0.09, lowpass: 4200, highpass: 700 })
    tone(620, 0.3, { gain: 0.04, type: 'triangle', delay: 0.03 })
    tone(820, 0.26, { gain: 0.035, type: 'triangle', delay: 0.08 })
    return
  }

  if (kind === 'save') {
    tone(86, 0.28, { gain: 0.16, type: 'sawtooth' })
    noise(0.3, { gain: 0.07, lowpass: 1600, highpass: 120 })
    return
  }

  if (kind === 'post') {
    tone(920, 0.46, { gain: 0.12, type: 'square' })
    tone(1380, 0.32, { gain: 0.045, type: 'triangle', delay: 0.04 })
    return
  }

  if (kind === 'chaos') {
    tone(190, 0.42, { gain: 0.08, type: 'sawtooth' })
    tone(330, 0.24, { gain: 0.055, type: 'square', delay: 0.08 })
    noise(0.58, { gain: 0.075, lowpass: 3200, highpass: 140 })
    return
  }

  if (kind === 'portal') {
    tone(140, 0.9, { gain: 0.08, type: 'sawtooth' })
    tone(280, 0.62, { gain: 0.045, type: 'sawtooth', detune: 20 })
    noise(0.8, { gain: 0.06, lowpass: 1800, highpass: 220 })
    return
  }

  if (kind === 'crowd') {
    noise(1.6, { gain: 0.09, lowpass: 3600, highpass: 240 })
    tone(220, 0.8, { gain: 0.025, type: 'triangle', delay: 0.08 })
  }
}

export function playOutcomeCues(effect: FootballCue, impact: 'net' | 'save' | 'post' | 'miss' | 'portal') {
  window.setTimeout(() => playFootballCue(effect), effect === 'chaos' ? 80 : 0)
  window.setTimeout(() => {
    if (impact === 'net') playFootballCue('net')
    if (impact === 'save') playFootballCue('save')
    if (impact === 'post') playFootballCue('post')
    if (impact === 'portal') playFootballCue('portal')
  }, 670)
  window.setTimeout(() => playFootballCue('crowd'), 820)
}
