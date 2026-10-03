export interface Pose {
  x: number
  z: number
  yaw: number
  crouch: number
  lean: number
  twist: number
  sway: number
  fall: number
  headPitch: number
  headYaw: number
  armL: number
  armR: number
  elbowL: number
  elbowR: number
  armOutL: number
  armOutR: number
  legL: number
  legR: number
  kneeL: number
  kneeR: number
  cape: number
}

const FIELDS = [
  'x',
  'z',
  'yaw',
  'crouch',
  'lean',
  'twist',
  'sway',
  'fall',
  'headPitch',
  'headYaw',
  'armL',
  'armR',
  'elbowL',
  'elbowR',
  'armOutL',
  'armOutR',
  'legL',
  'legR',
  'kneeL',
  'kneeR',
  'cape',
] as const

export const GUARD: Pose = {
  x: 0,
  z: 0,
  yaw: 0,
  crouch: 0.16,
  lean: 0.16,
  twist: -0.08,
  sway: 0,
  fall: 0,
  headPitch: 0.06,
  headYaw: 0,
  armL: -1.22,
  armR: -0.78,
  elbowL: -1.2,
  elbowR: -1.48,
  armOutL: 0.42,
  armOutR: -0.28,
  legL: 0.32,
  legR: -0.18,
  kneeL: 0.48,
  kneeR: 0.32,
  cape: 0.18,
}

export function pose(patch: Partial<Pose>): Pose {
  return { ...GUARD, ...patch }
}

export function lerpPose(a: Pose, b: Pose, u: number): Pose {
  const out = { ...a }
  for (const key of FIELDS) {
    out[key] = a[key] + (b[key] - a[key]) * u
  }
  return out
}

export function smoothstep(u: number): number {
  const x = Math.min(1, Math.max(0, u))
  return x * x * (3 - 2 * x)
}

export interface PoseKey {
  t: number
  pose: Pose
}

export function samplePose(keys: PoseKey[], t: number): Pose {
  if (t <= keys[0].t) return keys[0].pose
  const last = keys[keys.length - 1]
  if (t >= last.t) return last.pose
  let i = 0
  while (i < keys.length - 2 && keys[i + 1].t < t) i += 1
  const a = keys[i]
  const b = keys[i + 1]
  const u = smoothstep((t - a.t) / Math.max(0.0001, b.t - a.t))
  return lerpPose(a.pose, b.pose, u)
}
