import * as THREE from 'three'

interface Spark {
  life: number
  max: number
  vx: number
  vy: number
  vz: number
  x: number
  y: number
  z: number
  r: number
  g: number
  b: number
  active: boolean
}

interface Wave {
  mesh: THREE.Mesh
  life: number
  power: number
}

function glowTexture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')
  const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.35, 'rgba(255,190,120,0.7)')
  grd.addColorStop(1, 'rgba(255,80,0,0)')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, 64, 64)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export interface Fx {
  update(dt: number, frozen: boolean, scale: number): void
  burst(pos: THREE.Vector3, power: number, tint: 'ember' | 'cold' | 'clash'): void
  shockwave(pos: THREE.Vector3, power: number): void
}

const MAX = 520

export function createFx(scene: THREE.Scene): Fx {
  const sparks: Spark[] = []
  const positions = new Float32Array(MAX * 3)
  const colors = new Float32Array(MAX * 3)
  const geo = new THREE.BufferGeometry()
  positions.fill(0)
  for (let i = 0; i < MAX; i += 1) positions[i * 3 + 1] = -12
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40)
  const points = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size: 0.26,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    }),
  )
  scene.add(points)

  const spriteMat = new THREE.SpriteMaterial({
    map: glowTexture(),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    color: 0xffc48a,
  })
  const flashes: { sprite: THREE.Sprite; life: number }[] = []
  for (let i = 0; i < 8; i += 1) {
    const sprite = new THREE.Sprite(spriteMat.clone())
    sprite.visible = false
    sprite.scale.set(0.01, 0.01, 0.01)
    scene.add(sprite)
    flashes.push({ sprite, life: 0 })
  }

  const waves: Wave[] = []
  for (let i = 0; i < 4; i += 1) {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(0.18, 0.28, 40),
      new THREE.MeshBasicMaterial({
        color: 0xffb070,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    mesh.rotation.x = -Math.PI / 2
    mesh.visible = false
    scene.add(mesh)
    waves.push({ mesh, life: 0, power: 1 })
  }

  const emberPositions = new Float32Array(220 * 3)
  const emberColors = new Float32Array(220 * 3)
  const embers: { y: number; s: number; r: number; ang: number }[] = []
  for (let i = 0; i < 220; i += 1) {
    const ang = Math.random() * Math.PI * 2
    const rad = Math.random() * 6.2
    const y = Math.random() * 4
    emberPositions[i * 3] = Math.cos(ang) * rad
    emberPositions[i * 3 + 1] = y
    emberPositions[i * 3 + 2] = Math.sin(ang) * rad
    const hot = Math.random() > 0.35
    emberColors[i * 3] = hot ? 1 : 0.65
    emberColors[i * 3 + 1] = hot ? 0.42 : 0.4
    emberColors[i * 3 + 2] = hot ? 0.12 : 0.32
    embers.push({ y, s: 0.15 + Math.random() * 0.45, r: rad, ang })
  }
  const emberGeo = new THREE.BufferGeometry()
  emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3))
  emberGeo.setAttribute('color', new THREE.BufferAttribute(emberColors, 3))
  const emberPoints = new THREE.Points(
    emberGeo,
    new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    }),
  )
  scene.add(emberPoints)

  function spawn(origin: THREE.Vector3, power: number, color: [number, number, number], speed: number): void {
    let slot = sparks.find((spark) => !spark.active)
    if (!slot) {
      if (sparks.length >= MAX) slot = sparks[0]
      else {
        slot = {
          life: 0,
          max: 1,
          vx: 0,
          vy: 0,
          vz: 0,
          x: 0,
          y: 0,
          z: 0,
          r: 1,
          g: 1,
          b: 1,
          active: false,
        }
        sparks.push(slot)
      }
    }
    const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.8, Math.random() - 0.5).normalize()
    slot.active = true
    slot.life = 0.28 + Math.random() * 0.35
    slot.max = slot.life
    slot.x = origin.x + (Math.random() - 0.5) * 0.12
    slot.y = origin.y + (Math.random() - 0.5) * 0.12
    slot.z = origin.z + (Math.random() - 0.5) * 0.12
    slot.vx = dir.x * speed * power
    slot.vy = (0.6 + Math.random()) * speed * 0.8 * power
    slot.vz = dir.z * speed * power
    slot.r = color[0]
    slot.g = color[1]
    slot.b = color[2]
  }

  return {
    burst(pos, power, tint) {
      const count = Math.floor(18 + power * 26)
      const palette: Record<typeof tint, [number, number, number]> = {
        ember: [1, 0.42, 0.12],
        cold: [0.72, 0.9, 1],
        clash: [1, 0.78, 0.45],
      }
      for (let i = 0; i < count; i += 1) spawn(pos, power, palette[tint], 2.4 + Math.random() * 3.2)
      const flash = flashes.find((item) => item.life <= 0) ?? flashes[0]
      flash.life = 0.18 + power * 0.08
      flash.sprite.visible = true
      flash.sprite.position.copy(pos)
      flash.sprite.scale.setScalar(0.35 + power * 0.55)
      const mat = flash.sprite.material as THREE.SpriteMaterial
      mat.opacity = 1
      mat.color.set(tint === 'cold' ? 0xd8f6ff : 0xffc48a)
    },
    shockwave(pos, power) {
      const wave = waves.find((item) => item.life <= 0) ?? waves[0]
      wave.life = 0.45
      wave.power = power
      wave.mesh.visible = true
      wave.mesh.position.set(pos.x, 0.05, pos.z)
      wave.mesh.scale.setScalar(0.2)
      const mat = wave.mesh.material as THREE.MeshBasicMaterial
      mat.opacity = 0.8
    },
    update(dt, frozen, scale) {
      const step = frozen ? 0 : dt * scale
      for (let i = 0; i < sparks.length; i += 1) {
        const spark = sparks[i]
        if (!spark.active) {
          positions[i * 3 + 1] = -10
          continue
        }
        spark.life -= step
        if (spark.life <= 0) {
          spark.active = false
          positions[i * 3 + 1] = -10
          continue
        }
        spark.vy -= step * 4.5
        spark.x += spark.vx * step
        spark.y += spark.vy * step
        spark.z += spark.vz * step
        const fade = spark.life / spark.max
        positions[i * 3] = spark.x
        positions[i * 3 + 1] = spark.y
        positions[i * 3 + 2] = spark.z
        colors[i * 3] = spark.r * fade
        colors[i * 3 + 1] = spark.g * fade
        colors[i * 3 + 2] = spark.b * fade
      }
      geo.attributes.position.needsUpdate = true
      geo.attributes.color.needsUpdate = true

      for (const flash of flashes) {
        if (flash.life <= 0) continue
        flash.life -= dt
        const mat = flash.sprite.material as THREE.SpriteMaterial
        mat.opacity = Math.max(0, flash.life * 4)
        flash.sprite.scale.multiplyScalar(1 + dt * 2.2)
        if (flash.life <= 0) flash.sprite.visible = false
      }

      for (const wave of waves) {
        if (wave.life <= 0) continue
        wave.life -= dt
        const u = 1 - Math.max(0, wave.life) / 0.45
        wave.mesh.scale.setScalar(0.3 + u * (2.4 + wave.power))
        const mat = wave.mesh.material as THREE.MeshBasicMaterial
        mat.opacity = (1 - u) * 0.75
        if (wave.life <= 0) wave.mesh.visible = false
      }

      const drift = frozen ? 0 : dt * (0.35 + scale * 0.65)
      for (let i = 0; i < embers.length; i += 1) {
        const ember = embers[i]
        ember.y += ember.s * drift
        ember.ang += drift * 0.15
        if (ember.y > 4.2) ember.y = 0.05
        emberPositions[i * 3] = Math.cos(ember.ang) * ember.r
        emberPositions[i * 3 + 1] = ember.y
        emberPositions[i * 3 + 2] = Math.sin(ember.ang) * ember.r
      }
      emberGeo.attributes.position.needsUpdate = true
    },
  }
}
