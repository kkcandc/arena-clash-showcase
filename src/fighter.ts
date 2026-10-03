import * as THREE from 'three'
import type { Pose } from './pose'

export interface Fighter {
  name: 'kael' | 'sable'
  root: THREE.Group
  body: THREE.Group
  torso: THREE.Group
  head: THREE.Group
  armL: THREE.Group
  armR: THREE.Group
  foreL: THREE.Group
  foreR: THREE.Group
  legL: THREE.Group
  legR: THREE.Group
  kneeL: THREE.Group
  kneeR: THREE.Group
  cape: THREE.Group
  fistL: THREE.Object3D
  fistR: THREE.Object3D
  chest: THREE.Object3D
  blob: THREE.Mesh
  facing: number
  baseYaw: number
}

const geo = {
  torso: new THREE.CapsuleGeometry(0.23, 0.38, 4, 10),
  hips: new THREE.CapsuleGeometry(0.2, 0.12, 3, 8),
  head: new THREE.SphereGeometry(0.15, 16, 12),
  helm: new THREE.SphereGeometry(0.175, 16, 12),
  horn: new THREE.ConeGeometry(0.045, 0.22, 6),
  pauldron: new THREE.SphereGeometry(0.13, 12, 10),
  upper: new THREE.CapsuleGeometry(0.075, 0.28, 3, 8),
  fore: new THREE.CapsuleGeometry(0.062, 0.26, 3, 8),
  fist: new THREE.SphereGeometry(0.075, 10, 8),
  thigh: new THREE.CapsuleGeometry(0.09, 0.32, 3, 8),
  shin: new THREE.CapsuleGeometry(0.07, 0.3, 3, 8),
  boot: new THREE.BoxGeometry(0.12, 0.08, 0.22),
  collar: new THREE.TorusGeometry(0.16, 0.045, 6, 12),
  crest: new THREE.TorusGeometry(0.11, 0.02, 6, 16, Math.PI),
  cape: new THREE.PlaneGeometry(0.62, 1.05, 1, 4),
  tabard: new THREE.BoxGeometry(0.28, 0.45, 0.06),
  crack: new THREE.BoxGeometry(0.035, 0.22, 0.02),
  visor: new THREE.BoxGeometry(0.2, 0.045, 0.04),
}

function armor(color: number, emissive = 0x000000, intensity = 0): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.78,
    roughness: 0.32,
    clearcoat: 0.35,
    clearcoatRoughness: 0.45,
    emissive,
    emissiveIntensity: intensity,
  })
}

function cloth(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, metalness: 0.04, roughness: 0.86 })
}

function skinMat(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, metalness: 0.08, roughness: 0.58 })
}

function limb(group: THREE.Group, mesh: THREE.Mesh, length: number): THREE.Group {
  mesh.position.y = -length * 0.5
  mesh.castShadow = true
  group.add(mesh)
  return group
}

export function createFighter(name: 'kael' | 'sable'): Fighter {
  const ember = name === 'kael'
  const metal = armor(ember ? 0x3a2924 : 0x1a2230, ember ? 0xff4a12 : 0x79e7ff, ember ? 0.15 : 0.08)
  const trim = armor(ember ? 0x6a3a28 : 0x8ea4b8, ember ? 0xff6a22 : 0xb7fbff, ember ? 0.55 : 0.35)
  const hide = cloth(ember ? 0x140b0a : 0x100814)
  hide.side = THREE.DoubleSide
  const skin = skinMat(ember ? 0xc48b6a : 0xb7c0c8)
  const glow = armor(ember ? 0xff5a1f : 0x9af6ff, ember ? 0xff5a1f : 0x9af6ff, ember ? 2.4 : 2.1)

  const root = new THREE.Group()
  const body = new THREE.Group()
  root.add(body)

  const hips = new THREE.Group()
  hips.position.y = 0.96
  body.add(hips)
  const hipMesh = new THREE.Mesh(geo.hips, metal)
  hipMesh.castShadow = true
  hips.add(hipMesh)

  const torso = new THREE.Group()
  torso.position.y = 0.16
  hips.add(torso)
  const torsoMesh = new THREE.Mesh(geo.torso, metal)
  torsoMesh.scale.set(ember ? 1.12 : 0.92, 1, ember ? 1.05 : 0.9)
  torsoMesh.castShadow = true
  torso.add(torsoMesh)

  const chest = new THREE.Object3D()
  chest.position.set(0, 0.18, 0.16)
  torso.add(chest)

  if (ember) {
    const tabard = new THREE.Mesh(geo.tabard, hide)
    tabard.position.set(0, -0.08, 0.16)
    torso.add(tabard)
    const cracks = [
      [0.02, 0.12, 0.24, 0.2],
      [-0.08, 0.02, 0.23, -0.4],
      [0.1, -0.02, 0.22, 0.6],
    ] as const
    for (const [x, y, z, rot] of cracks) {
      const crack = new THREE.Mesh(geo.crack, glow)
      crack.position.set(x, y, z)
      crack.rotation.z = rot
      torso.add(crack)
    }
    const collar = new THREE.Mesh(geo.collar, trim)
    collar.rotation.x = Math.PI / 2
    collar.position.y = 0.28
    torso.add(collar)
  }

  const head = new THREE.Group()
  head.position.y = 0.48
  torso.add(head)
  const face = new THREE.Mesh(geo.head, skin)
  face.castShadow = true
  head.add(face)
  const helm = new THREE.Mesh(geo.helm, metal)
  helm.scale.set(1, ember ? 1.05 : 0.98, 1.05)
  helm.position.y = 0.03
  helm.castShadow = true
  head.add(helm)

  if (ember) {
    for (const side of [-1, 1]) {
      const horn = new THREE.Mesh(geo.horn, trim)
      horn.position.set(side * 0.1, 0.16, 0)
      horn.rotation.z = side * -0.45
      horn.castShadow = true
      head.add(horn)
    }
  } else {
    const crest = new THREE.Mesh(geo.crest, trim)
    crest.position.set(0, 0.16, 0)
    crest.rotation.z = Math.PI
    head.add(crest)
    const visor = new THREE.Mesh(geo.visor, glow)
    visor.position.set(0, 0.02, 0.15)
    head.add(visor)
  }

  function arm(side: 1 | -1): { shoulder: THREE.Group; elbow: THREE.Group; fist: THREE.Object3D } {
    const shoulder = new THREE.Group()
    shoulder.position.set(side * (ember ? 0.34 : 0.28), 0.28, 0)
    torso.add(shoulder)
    const pad = new THREE.Mesh(geo.pauldron, trim)
    pad.scale.set(1, 0.75, 1)
    pad.position.y = 0.04
    pad.castShadow = true
    shoulder.add(pad)
    const upper = limb(shoulder, new THREE.Mesh(geo.upper, metal), 0.34)
    const elbow = new THREE.Group()
    elbow.position.y = -0.36
    upper.add(elbow)
    limb(elbow, new THREE.Mesh(geo.fore, hide), 0.32)
    const fist = new THREE.Mesh(geo.fist, glow)
    fist.position.y = -0.36
    fist.castShadow = true
    elbow.add(fist)
    return { shoulder, elbow, fist }
  }

  const left = arm(1)
  const right = arm(-1)

  function leg(side: 1 | -1): { thigh: THREE.Group; knee: THREE.Group } {
    const thigh = new THREE.Group()
    thigh.position.set(side * 0.14, -0.08, 0)
    hips.add(thigh)
    limb(thigh, new THREE.Mesh(geo.thigh, metal), 0.38)
    const knee = new THREE.Group()
    knee.position.y = -0.4
    thigh.add(knee)
    limb(knee, new THREE.Mesh(geo.shin, metal), 0.36)
    const boot = new THREE.Mesh(geo.boot, hide)
    boot.position.set(0, -0.4, 0.04)
    boot.castShadow = true
    knee.add(boot)
    return { thigh, knee }
  }

  const legL = leg(1)
  const legR = leg(-1)

  const cape = new THREE.Group()
  cape.position.set(0, 0.22, -0.16)
  torso.add(cape)
  if (!ember) {
    for (const side of [-1, 1]) {
      const panel = new THREE.Mesh(geo.cape, hide)
      panel.position.set(side * 0.16, -0.48, 0)
      panel.castShadow = true
      cape.add(panel)
      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.02, 0.02), glow)
      edge.position.set(side * 0.42, -0.48, 0.01)
      cape.add(edge)
    }
  }

  const blob = new THREE.Mesh(
    new THREE.CircleGeometry(0.48, 20),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.42, depthWrite: false }),
  )
  blob.rotation.x = -Math.PI / 2
  blob.position.y = 0.025
  root.add(blob)

  const bulk = ember ? 1.06 : 0.98
  body.scale.set(bulk, ember ? 1.04 : 1, bulk)

  return {
    name,
    root,
    body,
    torso,
    head,
    armL: left.shoulder,
    armR: right.shoulder,
    foreL: left.elbow,
    foreR: right.elbow,
    legL: legL.thigh,
    legR: legR.thigh,
    kneeL: legL.knee,
    kneeR: legR.knee,
    cape,
    fistL: left.fist,
    fistR: right.fist,
    chest,
    blob,
    facing: ember ? 1 : -1,
    baseYaw: ember ? Math.PI / 2 : -Math.PI / 2,
  }
}

export function applyPose(fighter: Fighter, pose: Pose, breath: number): void {
  fighter.root.position.set(pose.x, pose.fall * 0.06, pose.z)
  fighter.root.rotation.y = fighter.baseYaw + pose.yaw
  fighter.body.rotation.x = -pose.fall * 1.38
  fighter.body.position.z = -pose.fall * 0.05

  const hipY = 0.96 - pose.crouch * 0.32
  const hips = fighter.torso.parent as THREE.Group
  hips.position.y = hipY

  fighter.torso.rotation.set(pose.lean + Math.sin(breath) * 0.018, pose.twist, pose.sway)
  fighter.head.rotation.set(pose.headPitch, pose.headYaw, 0)

  fighter.armL.rotation.set(pose.armL, 0, pose.armOutL)
  fighter.armR.rotation.set(pose.armR, 0, pose.armOutR)
  fighter.foreL.rotation.set(pose.elbowL, 0, 0)
  fighter.foreR.rotation.set(pose.elbowR, 0, 0)

  fighter.legL.rotation.set(pose.legL, 0, 0.08)
  fighter.legR.rotation.set(pose.legR, 0, -0.08)
  fighter.kneeL.rotation.set(pose.kneeL, 0, 0)
  fighter.kneeR.rotation.set(pose.kneeR, 0, 0)

  fighter.cape.rotation.x = pose.cape + Math.sin(breath * 0.8) * 0.06
  const blobMat = fighter.blob.material as THREE.MeshBasicMaterial
  blobMat.opacity = 0.42 * (1 - pose.fall * 0.85)
}
