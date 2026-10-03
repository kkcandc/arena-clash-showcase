import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { createAudio } from './audio'
import { createArena } from './arena'
import {
  DURATION,
  bloomAt,
  cues,
  kaelPose,
  sablePose,
  sampleCamera,
  type Cue,
} from './director'
import { createFighter, applyPose } from './fighter'
import { createFx } from './fx'

declare global {
  interface Window {
    __ring: {
      time: () => number
      mode: () => string
      seek: (t: number) => void
      tick: (dt: number) => { t: number; mode: string }
    }
  }
}

const params = new URLSearchParams(location.search)
const freezeAt = params.has('freeze') ? Number(params.get('freeze')) : null
const rate = params.has('rate') ? Number(params.get('rate')) : 1
const clean = params.has('clean')

const canvas = document.querySelector('#view') as HTMLCanvasElement
const title = document.querySelector('#title-block') as HTMLElement
const ko = document.querySelector('#ko') as HTMLElement
const flashEl = document.querySelector('#flash') as HTMLElement
const replayBtn = document.querySelector('#replay') as HTMLButtonElement
const muteBtn = document.querySelector('#mute') as HTMLButtonElement
const muteLabel = muteBtn.querySelector('.mute-label') as HTMLElement
const hint = document.querySelector('#sound-hint') as HTMLElement

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false,
  powerPreference: 'high-performance',
})
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.14
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6))
renderer.setSize(window.innerWidth, window.innerHeight)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 120)
createArena(scene)

const kael = createFighter('kael')
const sable = createFighter('sable')
scene.add(kael.root, sable.root)

const fx = createFx(scene)
const audio = createAudio()

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.78, 0.62, 0.68)
composer.addPass(bloom)
composer.addPass(new OutputPass())

const kickOffset = new THREE.Vector3()
let roll = 0
let fovPunch = 0
let shakeTime = 0
let shakeAmt = 0
let flash = 0
let cine = 0
let idleTime = 0
let hand = 0
let hitStop = 0
let timeScale = 1
let cueIndex = 0
let mode: 'play' | 'idle' | 'hold' = 'play'
let muted = false
let bootStinger = false

function resize(): void {
  const w = window.innerWidth
  const h = window.innerHeight
  camera.aspect = w / Math.max(1, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6))
  renderer.setSize(w, h)
  composer.setSize(w, h)
  bloom.setSize(w, h)
}

function presentedFov(fov: number): number {
  return camera.aspect < 0.9 ? fov + 14 : fov
}

function titleOpacity(t: number): number {
  if (mode === 'idle') return 0.92
  if (t < 2.7) return 1
  if (t < 3.7) return 1 - (t - 2.7)
  if (t < 19.0) return 0
  if (t < 20.2) return (t - 19.0) / 1.2
  return 1
}

function koOpacity(t: number): number {
  if (t < 16.62) return 0
  if (t < 17.15) return (t - 16.62) / 0.53
  if (t < 18.8) return 1
  if (t < 19.8) return 1 - (t - 18.8)
  return 0
}

function tintOf(who: Cue['who']): 'ember' | 'cold' | 'clash' {
  if (who === 'sable') return 'cold'
  if (who === 'clash') return 'clash'
  return 'ember'
}

function impactPoint(cue: Cue): THREE.Vector3 {
  if (cue.who === 'clash' || !cue.who) {
    const a = kael.chest.getWorldPosition(new THREE.Vector3())
    const b = sable.chest.getWorldPosition(new THREE.Vector3())
    return a.add(b).multiplyScalar(0.5)
  }
  const fighter = cue.who === 'kael' ? kael : sable
  const fist = cue.fist === 'R' ? fighter.fistR : fighter.fistL
  return fist.getWorldPosition(new THREE.Vector3())
}

function addKick(power: number, fovKick: number): void {
  const jitter = new THREE.Vector3(Math.random() - 0.5, (Math.random() - 0.5) * 0.5, Math.random() - 0.5)
  if (jitter.lengthSq() < 1e-5) jitter.set(0.3, 0.1, 0.2)
  jitter.normalize().multiplyScalar(power)
  kickOffset.add(jitter)
  roll += (Math.random() - 0.5) * power * 0.85
  fovPunch += fovKick
  shakeTime = 0.1
  shakeAmt = power * 0.4
}

function applyCue(cue: Cue): void {
  if (cue.timeScale !== undefined) timeScale = cue.timeScale
  if (cue.sfx === 'whoosh') audio.whoosh(cue.slow)
  if (cue.sfx === 'hit') audio.hit()
  if (cue.sfx === 'heavy') audio.heavy(cue.slow)
  if (cue.sfx === 'ko') audio.ko()
  if (cue.sfx === 'stinger') audio.stinger(false)
  if (cue.sfx === 'step') audio.step()
  if (cue.kick) addKick(cue.kick, cue.fovKick ?? 0)
  if (cue.flash) flash = Math.max(flash, cue.flash)
  if (cue.sparks || cue.shockwave) {
    const point = impactPoint(cue)
    if (cue.sparks) fx.burst(point, cue.sparks, tintOf(cue.who))
    if (cue.shockwave) fx.shockwave(point, cue.sparks ?? 1)
  }
  if (cue.hitStop) hitStop = Math.max(hitStop, cue.hitStop)
}

function fireDue(): void {
  while (cueIndex < cues.length && cues[cueIndex].t <= cine + 0.0001) {
    applyCue(cues[cueIndex])
    cueIndex += 1
  }
}

function syncUi(): void {
  title.style.opacity = String(titleOpacity(cine))
  ko.style.opacity = String(koOpacity(cine))
  flashEl.style.opacity = String(flash)
  const showHint = !clean && !audio.running() && !muted && replayBtn.hidden
  hint.hidden = !showHint
  if (clean) muteBtn.hidden = true
}

function toggleMute(): void {
  muted = !muted
  audio.unlock()
  audio.setMuted(muted)
  muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false')
  muteBtn.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound')
  muteLabel.textContent = muted ? 'Sound off' : 'Sound on'
  syncUi()
}

function replay(): void {
  cine = 0
  idleTime = 0
  hand = 0
  hitStop = 0
  timeScale = 1
  cueIndex = 0
  flash = 0
  roll = 0
  fovPunch = 0
  kickOffset.set(0, 0, 0)
  mode = 'play'
  replayBtn.hidden = true
  audio.unlock()
  bootStinger = true
}

function unlock(): void {
  const wasRunning = audio.running()
  audio.unlock()
  if (!wasRunning && !bootStinger && cine < 1.4) {
    audio.stinger(false)
    bootStinger = true
  }
}

function seek(t: number): void {
  cine = Math.max(0, Math.min(DURATION, t))
  cueIndex = cues.findIndex((cue) => cue.t > cine)
  if (cueIndex < 0) cueIndex = cues.length
  timeScale = 1
  for (const cue of cues) {
    if (cue.t <= cine && cue.timeScale !== undefined) timeScale = cue.timeScale
  }
  hitStop = 0
  mode = freezeAt !== null && cine >= freezeAt ? 'hold' : cine >= DURATION ? 'idle' : 'play'
  replayBtn.hidden = mode !== 'idle'
}

window.addEventListener('pointerdown', () => unlock())
muteBtn.addEventListener('click', (event) => {
  event.stopPropagation()
  toggleMute()
})
replayBtn.addEventListener('click', (event) => {
  event.stopPropagation()
  replay()
})
window.addEventListener('keydown', (event) => {
  unlock()
  if (event.key === 'm' || event.key === 'M') toggleMute()
  if (event.key === 'r' || event.key === 'R') replay()
})
window.addEventListener('resize', resize)

const clock = new THREE.Clock()
const capture = params.has('capture')

function frame(dt: number): void {
  if (mode === 'play') {
    if (hitStop > 0) hitStop = Math.max(0, hitStop - dt)
    else {
      const playRate = Number.isFinite(rate) && rate > 0 ? rate : 1
      cine += dt * timeScale * playRate
      if (freezeAt !== null && Number.isFinite(freezeAt) && cine >= freezeAt) cine = freezeAt
      if (cine >= DURATION) cine = DURATION
    }
  } else if (mode === 'idle') {
    idleTime += dt
  }

  const breath = (mode === 'idle' ? idleTime : cine) * 2.3
  applyPose(kael, kaelPose(cine), breath)
  applyPose(sable, sablePose(cine), breath)
  if (hitStop <= 0 && mode !== 'idle') fireDue()
  if (mode === 'play') {
    if (freezeAt !== null && Number.isFinite(freezeAt) && cine >= freezeAt) mode = 'hold'
    else if (cine >= DURATION) {
      mode = 'idle'
      replayBtn.hidden = false
    }
  }

  const frozen = hitStop > 0
  if (!frozen) hand += dt
  fx.update(dt, frozen, timeScale)

  const shot = sampleCamera(cine)
  let px = shot.px
  let py = shot.py
  let pz = shot.pz
  if (mode === 'idle') {
    px += Math.sin(idleTime * 0.17) * 1.2
    pz += Math.cos(idleTime * 0.17) * 0.4
  }
  const decay = Math.exp(-dt * 5.2)
  kickOffset.multiplyScalar(decay)
  roll *= decay
  fovPunch *= Math.exp(-dt * 5.4)
  if (shakeTime > 0) {
    shakeTime -= dt
    px += (Math.random() - 0.5) * shakeAmt
    py += (Math.random() - 0.5) * shakeAmt * 0.6
  }
  px += Math.sin(hand * 1.7) * 0.012
  py += Math.cos(hand * 1.25) * 0.008
  camera.position.set(px + kickOffset.x, py + kickOffset.y, pz + kickOffset.z)
  camera.fov = presentedFov(shot.fov + fovPunch)
  camera.updateProjectionMatrix()
  camera.lookAt(shot.lx, shot.ly, shot.lz)
  camera.rotateZ(roll)

  bloom.strength += (bloomAt(cine) - bloom.strength) * (1 - Math.exp(-dt * 3.5))
  if (flash > 0) flash = Math.max(0, flash - dt * 0.8)
  syncUi()
  composer.render()
}

window.__ring = {
  time: () => cine,
  mode: () => mode,
  seek,
  tick: (dt: number) => {
    frame(dt)
    return { t: cine, mode }
  },
}

if (freezeAt !== null && Number.isFinite(freezeAt) && freezeAt <= 0) seek(0)
if (capture) frame(0)
else {
  const loop = (): void => {
    frame(Math.min(clock.getDelta(), 0.05))
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}
