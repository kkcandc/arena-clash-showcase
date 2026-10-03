export interface AudioBus {
  unlock(): void
  setMuted(muted: boolean): void
  isMuted(): boolean
  running(): boolean
  whoosh(slow?: boolean): void
  hit(): void
  heavy(slow?: boolean): void
  ko(): void
  stinger(big?: boolean): void
  step(): void
}

export function createAudio(): AudioBus {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const ctx = new AudioCtx()
  const master = ctx.createGain()
  master.gain.value = 1
  const compressor = ctx.createDynamicsCompressor()
  compressor.threshold.value = -12
  compressor.knee.value = 16
  compressor.ratio.value = 3
  compressor.attack.value = 0.004
  compressor.release.value = 0.22
  master.connect(compressor)
  compressor.connect(ctx.destination)

  const delay = ctx.createDelay()
  delay.delayTime.value = 0.17
  const feedback = ctx.createGain()
  feedback.gain.value = 0.26
  const wet = ctx.createGain()
  wet.gain.value = 0.28
  delay.connect(feedback)
  feedback.connect(delay)
  delay.connect(wet)
  wet.connect(master)

  const ambient = ctx.createGain()
  ambient.gain.value = 0.22
  ambient.connect(master)

  let noise: AudioBuffer | null = null
  function noiseBuffer(): AudioBuffer {
    if (noise) return noise
    const length = ctx.sampleRate
    noise = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1
    return noise
  }

  let started = false
  let muted = false

  function tone(
    freq: number,
    end: number,
    dur: number,
    gain: number,
    type: OscillatorType,
    when = 0,
  ): void {
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()
    osc.type = type
    const t0 = ctx.currentTime + when
    osc.frequency.setValueAtTime(Math.max(30, freq), t0)
    osc.frequency.exponentialRampToValueAtTime(Math.max(28, end), t0 + dur)
    amp.gain.setValueAtTime(0.0001, t0)
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012)
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    osc.connect(amp)
    amp.connect(master)
    amp.connect(delay)
    osc.start(t0)
    osc.stop(t0 + dur + 0.02)
  }

  function noiseHit(dur: number, gain: number, freq: number, q: number): void {
    const src = ctx.createBufferSource()
    src.buffer = noiseBuffer()
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = freq
    filter.Q.value = q
    const amp = ctx.createGain()
    const t0 = ctx.currentTime
    amp.gain.setValueAtTime(gain, t0)
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    src.connect(filter)
    filter.connect(amp)
    amp.connect(master)
    amp.connect(delay)
    src.start(t0)
    src.stop(t0 + dur)
  }

  function startBed(): void {
    if (started) return
    started = true
    const droneA = ctx.createOscillator()
    const droneB = ctx.createOscillator()
    droneA.type = 'sine'
    droneB.type = 'triangle'
    droneA.frequency.value = 55
    droneB.frequency.value = 82.4
    const droneGain = ctx.createGain()
    droneGain.gain.value = 0.18
    droneA.connect(droneGain)
    droneB.connect(droneGain)
    droneGain.connect(ambient)
    droneA.start()
    droneB.start()

    const wind = ctx.createBufferSource()
    wind.buffer = noiseBuffer()
    wind.loop = true
    const low = ctx.createBiquadFilter()
    low.type = 'lowpass'
    low.frequency.value = 420
    const windGain = ctx.createGain()
    windGain.gain.value = 0.08
    wind.connect(low)
    low.connect(windGain)
    windGain.connect(ambient)
    wind.start()

    const crowd = ctx.createBufferSource()
    crowd.buffer = noiseBuffer()
    crowd.loop = true
    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.value = 1400
    band.Q.value = 0.7
    const crowdGain = ctx.createGain()
    crowdGain.gain.value = 0.015
    crowd.connect(band)
    band.connect(crowdGain)
    crowdGain.connect(ambient)
    crowd.start()

    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.18
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.01
    lfo.connect(lfoGain)
    lfoGain.connect(crowdGain.gain)
    lfo.start()
  }

  const notes = [146.83, 174.61, 220, 293.66, 261.63, 220]

  function stinger(big = false): void {
    const gain = big ? 0.16 : 0.09
    notes.forEach((freq, index) => {
      const step = big ? 0.16 : 0.13
      tone(freq, freq, big ? 0.42 : 0.28, gain, 'triangle', index * step)
      if (big && index % 2 === 0) tone(freq / 2, freq / 2, 0.5, gain * 0.7, 'sine', index * step)
    })
  }

  return {
    unlock() {
      if (ctx.state !== 'running') void ctx.resume()
      startBed()
    },
    setMuted(next) {
      muted = next
      const now = ctx.currentTime
      master.gain.cancelScheduledValues(now)
      master.gain.linearRampToValueAtTime(next ? 0 : 1, now + 0.04)
    },
    isMuted: () => muted,
    running: () => ctx.state === 'running',
    whoosh(slow = false) {
      const src = ctx.createBufferSource()
      src.buffer = noiseBuffer()
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.Q.value = slow ? 3 : 1.4
      const amp = ctx.createGain()
      const t0 = ctx.currentTime
      const dur = slow ? 0.55 : 0.22
      filter.frequency.setValueAtTime(slow ? 180 : 280, t0)
      filter.frequency.exponentialRampToValueAtTime(slow ? 900 : 2200, t0 + dur)
      amp.gain.setValueAtTime(0.0001, t0)
      amp.gain.exponentialRampToValueAtTime(slow ? 0.18 : 0.22, t0 + dur * 0.35)
      amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
      src.connect(filter)
      filter.connect(amp)
      amp.connect(master)
      src.start(t0)
      src.stop(t0 + dur)
    },
    hit() {
      tone(150, 42, 0.18, 0.34, 'sine')
      tone(420, 180, 0.09, 0.08, 'triangle')
      noiseHit(0.09, 0.2, 900, 0.8)
    },
    heavy(slow = false) {
      tone(slow ? 90 : 110, 32, slow ? 0.42 : 0.26, 0.46, 'sine')
      tone(220, 70, 0.16, 0.12, 'triangle')
      noiseHit(slow ? 0.22 : 0.14, 0.32, 500, 0.6)
      tone(880, 440, 0.08, 0.05, 'square')
    },
    ko() {
      tone(70, 24, 0.7, 0.6, 'sine')
      tone(48, 22, 0.9, 0.35, 'sine')
      noiseHit(0.45, 0.5, 240, 0.4)
      tone(1400, 300, 0.25, 0.06, 'triangle')
      ambient.gain.cancelScheduledValues(ctx.currentTime)
      ambient.gain.setValueAtTime(0.4, ctx.currentTime)
      ambient.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 1.2)
      stinger(true)
    },
    stinger,
    step() {
      tone(90, 50, 0.08, 0.08, 'sine')
      noiseHit(0.05, 0.06, 200, 1)
    },
  }
}
