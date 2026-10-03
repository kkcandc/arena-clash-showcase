import * as THREE from 'three'

export function createArena(scene: THREE.Scene): void {
  scene.background = new THREE.Color(0x07060c)
  scene.fog = new THREE.FogExp2(0x0c0a12, 0.048)

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(90, 32, 18),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        top: { value: new THREE.Color('#070814') },
        horizon: { value: new THREE.Color('#2a160f') },
      },
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPos;
        uniform vec3 top;
        uniform vec3 horizon;
        void main() {
          float h = normalize(vPos).y;
          float f = smoothstep(-0.2, 0.55, h);
          gl_FragColor = vec4(mix(horizon, top, f), 1.0);
        }
      `,
    }),
  )
  scene.add(sky)

  const moon = new THREE.Mesh(
    new THREE.CircleGeometry(3.1, 40),
    new THREE.MeshBasicMaterial({ color: 0xffe2c0 }),
  )
  moon.position.set(-16, 24, -36)
  moon.lookAt(0, 0, 0)
  scene.add(moon)

  const stone = new THREE.MeshStandardMaterial({ color: 0x2a241f, roughness: 0.92, metalness: 0.08 })
  const dark = new THREE.MeshStandardMaterial({ color: 0x14110f, roughness: 0.84, metalness: 0.18 })
  const ash = new THREE.MeshStandardMaterial({ color: 0x1a1412, roughness: 0.7, metalness: 0.22 })
  const ember = new THREE.MeshStandardMaterial({
    color: 0xff5a1f,
    emissive: 0xff4a12,
    emissiveIntensity: 2.2,
    roughness: 0.4,
    metalness: 0.2,
  })

  const ground = new THREE.Mesh(new THREE.CircleGeometry(28, 48), stone)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  const floor = new THREE.Mesh(new THREE.CircleGeometry(6.4, 64), ash)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = 0.012
  floor.receiveShadow = true
  scene.add(floor)

  const inner = new THREE.Mesh(new THREE.CircleGeometry(3.1, 48), dark)
  inner.rotation.x = -Math.PI / 2
  inner.position.y = 0.02
  inner.receiveShadow = true
  scene.add(inner)

  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.55, 0.045, 8, 80), ember)
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.04
  scene.add(ring)

  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(6.15, 0.08, 8, 80),
    new THREE.MeshStandardMaterial({ color: 0x3a312b, roughness: 0.8, metalness: 0.3 }),
  )
  outerRing.rotation.x = Math.PI / 2
  outerRing.position.y = 0.03
  scene.add(outerRing)

  for (let i = 0; i < 18; i += 1) {
    const crack = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, 0.7 + (i % 3) * 0.25), ember)
    const ang = (i / 18) * Math.PI * 2
    const rad = 1.2 + (i % 5) * 0.55
    crack.position.set(Math.cos(ang) * rad, 0.03, Math.sin(ang) * rad)
    crack.rotation.y = ang + 0.4
    scene.add(crack)
  }

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x221c19, roughness: 0.9, metalness: 0.12 })
  for (let i = 0; i < 20; i += 1) {
    const ang = (i / 20) * Math.PI * 2
    const wall = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.55, 0.28), wallMat)
    const r = 6.55
    wall.position.set(Math.cos(ang) * r, 0.28, Math.sin(ang) * r)
    wall.lookAt(0, 0.28, 0)
    wall.castShadow = true
    wall.receiveShadow = true
    scene.add(wall)
  }

  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x332924, roughness: 0.78, metalness: 0.16 })
  for (let i = 0; i < 12; i += 1) {
    const ang = (i / 12) * Math.PI * 2 + 0.12
    const r = 9.3
    const ruined = i === 3
    const height = ruined ? 2.4 : 4.6
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, height, 8), pillarMat)
    pillar.position.set(Math.cos(ang) * r, height / 2, Math.sin(ang) * r)
    pillar.castShadow = true
    pillar.receiveShadow = true
    scene.add(pillar)

    if (!ruined) {
      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.28, 1.15), pillarMat)
      cap.position.set(Math.cos(ang) * r, height + 0.05, Math.sin(ang) * r)
      cap.castShadow = true
      scene.add(cap)
    }

    const brazier = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.2, 0.18, 8),
      new THREE.MeshStandardMaterial({ color: 0x2a211c, metalness: 0.4, roughness: 0.5 }),
    )
    brazier.position.set(Math.cos(ang) * 7.55, 0.7, Math.sin(ang) * 7.55)
    scene.add(brazier)
    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xff6a2a : 0xffc27a }),
    )
    flame.position.set(brazier.position.x, 0.92, brazier.position.z)
    scene.add(flame)

    const torch = new THREE.PointLight(0xff7a3a, 10, 7.5, 2)
    torch.position.set(brazier.position.x, 1.15, brazier.position.z)
    scene.add(torch)
  }

  const seatMat = new THREE.MeshStandardMaterial({ color: 0x120e0d, roughness: 1, metalness: 0 })
  for (let tier = 0; tier < 3; tier += 1) {
    const seats = new THREE.Mesh(
      new THREE.CylinderGeometry(11.2 + tier * 1.15, 11.4 + tier * 1.15, 0.7, 32, 1, true),
      seatMat,
    )
    seats.position.y = 1.3 + tier * 0.75
    scene.add(seats)
  }

  for (let i = 0; i < 28; i += 1) {
    const ang = (i / 28) * Math.PI * 2
    const figure = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.35, 2, 6), seatMat)
    const r = 10.4 + (i % 3) * 0.7
    figure.position.set(Math.cos(ang) * r, 1.7 + (i % 3) * 0.45, Math.sin(ang) * r)
    figure.lookAt(0, figure.position.y, 0)
    scene.add(figure)
  }

  const hemi = new THREE.HemisphereLight(0x24304a, 0x2a120c, 0.55)
  scene.add(hemi)

  const moonLight = new THREE.DirectionalLight(0xc5d4ff, 2.4)
  moonLight.position.set(8, 14, -6)
  moonLight.castShadow = true
  moonLight.shadow.mapSize.set(2048, 2048)
  moonLight.shadow.camera.near = 2
  moonLight.shadow.camera.far = 40
  moonLight.shadow.camera.left = -14
  moonLight.shadow.camera.right = 14
  moonLight.shadow.camera.top = 14
  moonLight.shadow.camera.bottom = -14
  moonLight.shadow.bias = -0.00035
  scene.add(moonLight)

  const shaft = new THREE.SpotLight(0xffb27a, 90, 28, 0.48, 0.65, 1)
  shaft.position.set(0.4, 11, 1.2)
  shaft.target.position.set(0, 0, 0)
  shaft.castShadow = true
  shaft.shadow.mapSize.set(1024, 1024)
  shaft.shadow.bias = -0.0004
  scene.add(shaft)
  scene.add(shaft.target)

  const cone = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 3.4, 9, 24, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xff7a3c,
      transparent: true,
      opacity: 0.045,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  cone.position.y = 4.6
  scene.add(cone)

  const rimWarm = new THREE.PointLight(0xff6a2a, 36, 9, 2)
  rimWarm.position.set(-2.4, 1.8, -1.6)
  scene.add(rimWarm)
  const rimCool = new THREE.PointLight(0x78e7ff, 32, 9, 2)
  rimCool.position.set(2.4, 1.8, -1.6)
  scene.add(rimCool)

  const fill = new THREE.DirectionalLight(0xffd2b0, 0.55)
  fill.position.set(-6, 4, 5)
  scene.add(fill)
}
