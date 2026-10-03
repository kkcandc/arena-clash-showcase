import { pose, samplePose, type Pose, type PoseKey } from './pose'

export const DURATION = 22

export interface CamKey {
  t: number
  px: number
  py: number
  pz: number
  lx: number
  ly: number
  lz: number
  fov: number
}

export interface Cue {
  t: number
  sfx?: 'whoosh' | 'hit' | 'heavy' | 'ko' | 'stinger' | 'step'
  hitStop?: number
  kick?: number
  fovKick?: number
  flash?: number
  sparks?: number
  shockwave?: boolean
  timeScale?: number
  bloom?: number
  who?: 'kael' | 'sable' | 'clash'
  fist?: 'L' | 'R'
  slow?: boolean
}

function k(t: number, patch: Partial<Pose>): PoseKey {
  return { t, pose: pose(patch) }
}

const kael: PoseKey[] = [
  k(0, { x: -1.75, z: 0 }),
  k(3.3, { x: -1.05, z: 0.05, lean: 0.22, crouch: 0.2 }),
  k(5.05, { x: -0.78, z: 0.02, lean: 0.08, twist: -0.35, armL: -0.55, elbowL: -1.55, armOutL: 0.2, crouch: 0.22 }),
  k(5.48, { x: -0.12, z: 0, lean: 0.55, twist: 0.48, armL: -1.7, elbowL: -0.08, armOutL: 0.02, armR: -0.7, legL: -0.25, legR: 0.55, kneeR: 0.55, crouch: 0.04 }),
  k(6.15, { x: -0.72, z: 0.02 }),
  k(6.7, { x: -0.95, z: 0.08, lean: -0.28, sway: 0.22, twist: -0.25, headPitch: 0.42, headYaw: -0.2, armL: -0.45, armR: -0.35, crouch: 0.28, cape: 0.4 }),
  k(7.45, { x: -0.82, z: 0.04 }),
  k(8.05, { x: -0.7, z: 0.18, twist: 0.45, lean: 0.05, armR: -0.4, elbowR: -1.7, armOutR: -0.2, crouch: 0.24 }),
  k(8.28, { x: -0.18, z: 0.18, twist: -0.95, lean: 0.32, sway: -0.22, armR: -1.25, elbowR: -0.4, armOutR: -1.15, armL: -0.8, crouch: 0.18 }),
  k(9.05, { x: -0.7, z: 0.08 }),
  k(9.7, { x: -0.95, z: -0.05, crouch: 0.55, lean: 0.5, twist: 0.35, headPitch: 0.32, armL: -0.35, armR: -0.3, elbowL: -1.1, elbowR: -1.1 }),
  k(10.7, { x: -0.85, z: 0 }),
  k(12.15, { x: -0.95, z: -0.05, lean: -0.42, twist: -0.45, crouch: 0.32, armR: -2.45, elbowR: -0.35, armOutR: -0.2, cape: -0.1 }),
  k(13.15, { x: -0.08, z: 0.02, lean: 0.38, twist: 0.25, armL: -1.62, elbowL: -0.12, armR: -1.5, elbowR: -0.28, armOutR: -0.15, crouch: 0.04, legL: -0.3 }),
  k(14.15, { x: -1.15, z: 0.12, lean: -0.45, sway: 0.32, fall: 0.12, armL: -0.3, armR: -0.25, headPitch: 0.35 }),
  k(15.7, { x: -1.0, z: 0.05, fall: 0.02, lean: 0.1, crouch: 0.3 }),
  k(16.25, { x: -0.9, z: 0.02, lean: -0.1, armL: -0.5, headPitch: 0.1 }),
  k(16.5, { x: -0.7, z: 0, lean: -0.2, fall: 0.25, armL: -0.2, armR: -0.4 }),
  k(17.45, { x: -1.15, z: 0.05, fall: 1.05, lean: 0.1, armL: -0.15, armR: -0.7, elbowL: -0.35, elbowR: -0.45, legL: 0.15, legR: -0.05, kneeL: 0.15, kneeR: 0.1, cape: 0.8 }),
  k(22, { x: -1.15, z: 0.05, fall: 1.05, lean: 0.1, armL: -0.15, armR: -0.7, elbowL: -0.35, elbowR: -0.45, legL: 0.15, legR: -0.05, kneeL: 0.15, kneeR: 0.1 }),
]

const sable: PoseKey[] = [
  k(0, { x: 1.75, z: 0 }),
  k(3.3, { x: 1.05, z: -0.04, lean: 0.2 }),
  k(5.2, { x: 0.95, z: -0.02, lean: 0.05, headYaw: 0.1 }),
  k(5.48, { x: 0.98, z: -0.08, lean: -0.28, sway: -0.18, headPitch: 0.48, headYaw: 0.28, armL: -0.35, armR: -0.25, crouch: 0.2 }),
  k(6.2, { x: 0.92, z: 0 }),
  k(6.55, { x: 0.78, z: 0.02, twist: 0.3, lean: 0.05, armL: -0.5, elbowL: -1.55, crouch: 0.18 }),
  k(6.78, { x: 0.16, z: 0, lean: 0.52, twist: -0.48, armL: -1.7, elbowL: -0.08, armOutL: 0.04, legL: -0.2, legR: 0.48, cape: 0.7 }),
  k(7.55, { x: 0.82, z: -0.02 }),
  k(8.15, { x: 0.9, z: 0.02, crouch: 0.2 }),
  k(8.28, { x: 1.05, z: -0.12, crouch: 0.58, lean: 0.55, twist: 0.4, headPitch: 0.28, armL: -0.3, armR: -0.25 }),
  k(9.05, { x: 0.78, z: 0.05, lean: 0.18, twist: -0.1, crouch: 0.16 }),
  k(9.55, { x: 0.85, z: 0.1, twist: -0.9, yaw: -0.35, armR: -0.35, elbowR: -0.9, armOutR: -0.4, cape: 0.2, lean: 0.05 }),
  k(9.8, { x: 0.48, z: 0.16, twist: 1.15, yaw: 0.55, armR: -0.45, elbowR: -0.25, armOutR: -1.25, lean: 0.12, cape: 0.95 }),
  k(10.7, { x: 0.9, z: 0, yaw: 0 }),
  k(12.35, { x: 0.72, z: -0.02, crouch: 0.22, lean: 0.28, armL: -1.35, elbowL: -0.7, armR: -1.2, elbowR: -0.8 }),
  k(13.15, { x: 0.16, z: 0, lean: 0.36, twist: -0.2, armL: -1.65, elbowL: -0.1, armR: -1.45, elbowR: -0.25, crouch: 0.04, cape: 0.85 }),
  k(14.2, { x: 0.85, z: -0.04, lean: 0.12 }),
  k(15.85, { x: 0.62, z: 0.02, lean: 0.2, crouch: 0.12 }),
  k(16.2, { x: 0.55, z: 0, twist: -0.3, armL: -0.45, elbowL: -1.5, lean: -0.05, cape: 0.1 }),
  k(16.45, { x: 0.12, z: 0.02, lean: 0.62, twist: 0.5, armL: -1.72, elbowL: -0.08, armOutL: 0.02, legL: -0.45, legR: 0.25, cape: 0.85, crouch: 0.02 }),
  k(17.7, { x: 0.48, z: 0, lean: -0.08, crouch: 0.04, twist: -0.12, armL: -0.35, elbowL: -0.25, armOutL: 0.55, armR: -0.95, elbowR: -0.35, cape: 0.22, yaw: -0.08 }),
  k(22, { x: 0.48, z: 0, lean: -0.08, crouch: 0.04, twist: -0.12, armL: -0.35, elbowL: -0.25, armOutL: 0.55, armR: -0.95, elbowR: -0.35, cape: 0.22, yaw: -0.08 }),
]

export const cameraKeys: CamKey[] = [
  { t: 0, px: 0, py: 5.6, pz: 8.4, lx: 0, ly: 1.25, lz: 0, fov: 40 },
  { t: 2.6, px: 0.2, py: 3.8, pz: 6.8, lx: 0, ly: 1.35, lz: 0, fov: 36 },
  { t: 4.5, px: 1.6, py: 1.9, pz: 4.4, lx: 0, ly: 1.35, lz: 0, fov: 33 },
  { t: 5.4, px: 0.15, py: 1.5, pz: 2.85, lx: 0.15, ly: 1.4, lz: 0, fov: 29 },
  { t: 6.65, px: -1.7, py: 1.6, pz: 3.15, lx: 0, ly: 1.4, lz: 0, fov: 31 },
  { t: 8.15, px: 1.9, py: 1.2, pz: 2.55, lx: 0.15, ly: 1.25, lz: 0.05, fov: 28 },
  { t: 9.65, px: -2.15, py: 1.65, pz: 2.7, lx: 0.05, ly: 1.35, lz: 0.05, fov: 32 },
  { t: 11.6, px: 0.15, py: 0.85, pz: 3.35, lx: 0, ly: 1.3, lz: 0, fov: 30 },
  { t: 12.5, px: -0.45, py: 0.7, pz: 2.35, lx: 0, ly: 1.28, lz: 0, fov: 25 },
  { t: 13.25, px: 0.1, py: 1.05, pz: 1.75, lx: 0, ly: 1.32, lz: 0, fov: 23 },
  { t: 16.15, px: 1.25, py: 1.35, pz: 2.9, lx: 0.05, ly: 1.2, lz: 0, fov: 28 },
  { t: 16.48, px: 0.2, py: 1.45, pz: 2.15, lx: -0.25, ly: 1.15, lz: 0, fov: 21 },
  { t: 18.3, px: 0.35, py: 2.7, pz: 6.2, lx: -0.35, ly: 0.85, lz: 0, fov: 36 },
  { t: 22, px: 0.15, py: 3.15, pz: 7.1, lx: -0.4, ly: 0.7, lz: 0, fov: 38 },
]

export const cues: Cue[] = [
  { t: 0.2, sfx: 'stinger' },
  { t: 3.35, sfx: 'step' },
  { t: 5.22, sfx: 'whoosh' },
  { t: 5.48, sfx: 'hit', hitStop: 0.13, kick: 0.22, fovKick: 3.2, flash: 0.2, sparks: 1.15, who: 'kael', fist: 'L' },
  { t: 6.52, sfx: 'whoosh' },
  { t: 6.78, sfx: 'hit', hitStop: 0.14, kick: 0.26, fovKick: 3.6, flash: 0.22, sparks: 1.2, who: 'sable', fist: 'L' },
  { t: 8.02, sfx: 'whoosh' },
  { t: 8.28, sfx: 'heavy', hitStop: 0.17, kick: 0.38, fovKick: 5, flash: 0.34, sparks: 1.7, shockwave: true, who: 'kael', fist: 'R' },
  { t: 9.52, sfx: 'whoosh' },
  { t: 9.8, sfx: 'heavy', hitStop: 0.17, kick: 0.4, fovKick: 5.2, flash: 0.36, sparks: 1.75, shockwave: true, who: 'sable', fist: 'R' },
  { t: 12.42, sfx: 'whoosh', timeScale: 0.24, bloom: 1.2, slow: true },
  { t: 13.15, sfx: 'heavy', hitStop: 0.24, kick: 0.62, fovKick: 8, sparks: 2.5, shockwave: true, flash: 0.55, who: 'clash', slow: true },
  { t: 13.7, timeScale: 1, bloom: 0.78 },
  { t: 16.12, sfx: 'whoosh' },
  { t: 16.45, sfx: 'ko', hitStop: 0.3, kick: 0.78, fovKick: 10, sparks: 2.8, shockwave: true, flash: 1, who: 'sable', fist: 'L' },
]

export function kaelPose(t: number): Pose {
  return samplePose(kael, t)
}

export function sablePose(t: number): Pose {
  return samplePose(sable, t)
}

export function sampleCamera(t: number): CamKey {
  if (t <= cameraKeys[0].t) return cameraKeys[0]
  const last = cameraKeys[cameraKeys.length - 1]
  if (t >= last.t) return last
  let i = 0
  while (i < cameraKeys.length - 2 && cameraKeys[i + 1].t < t) i += 1
  const a = cameraKeys[i]
  const b = cameraKeys[i + 1]
  const u = (t - a.t) / Math.max(0.0001, b.t - a.t)
  const s = u * u * (3 - 2 * u)
  return {
    t,
    px: a.px + (b.px - a.px) * s,
    py: a.py + (b.py - a.py) * s,
    pz: a.pz + (b.pz - a.pz) * s,
    lx: a.lx + (b.lx - a.lx) * s,
    ly: a.ly + (b.ly - a.ly) * s,
    lz: a.lz + (b.lz - a.lz) * s,
    fov: a.fov + (b.fov - a.fov) * s,
  }
}

export function scaleAt(t: number): number {
  let scale = 1
  for (const cue of cues) {
    if (cue.t <= t && cue.timeScale !== undefined) scale = cue.timeScale
  }
  return scale
}

export function bloomAt(t: number): number {
  let bloom = 0.78
  for (const cue of cues) {
    if (cue.t <= t && cue.bloom !== undefined) bloom = cue.bloom
  }
  return bloom
}
