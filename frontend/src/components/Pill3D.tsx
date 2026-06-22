import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, Float, Sparkles } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'

/* 실제 3D 알약(캡슐) — React Three Fiber + drei.
   스튜디오 라이팅(Environment+Lightformer)·소프트 접지 그림자·부유(Float)·스프링 등장·민트 입자.
   좌우 2색은 셰이더 per-fragment 하드 경계, 대각선 턴테이블 회전. reduced-motion·60fps 가드. */
function Capsule({ reduce }: { reduce: boolean }) {
  const spinRef = useRef<THREE.Group>(null)

  const geo = useMemo(() => new THREE.CapsuleGeometry(0.85, 1.75, 16, 48), [])

  const mat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.26,
      metalness: 0,
      clearcoat: 0.85,
      clearcoatRoughness: 0.22,
    })
    const top = new THREE.Color('#f6f8f8').convertSRGBToLinear()
    const bot = new THREE.Color('#1fd0b1').convertSRGBToLinear()
    m.onBeforeCompile = (s) => {
      s.uniforms.uTop = { value: top }
      s.uniforms.uBot = { value: bot }
      s.vertexShader = s.vertexShader
        .replace('#include <common>', '#include <common>\nvarying float vSplit;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n  vSplit = position.y;')
      s.fragmentShader = s.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\nvarying float vSplit;\nuniform vec3 uTop;\nuniform vec3 uBot;',
        )
        .replace(
          '#include <color_fragment>',
          '#include <color_fragment>\n  diffuseColor.rgb = vSplit >= 0.0 ? uTop : uBot;',
        )
    }
    return m
  }, [])

  const { scale } = useSpring({
    from: { scale: 0.15 },
    to: { scale: 1 },
    immediate: reduce,
    config: { mass: 1, tension: 170, friction: 13 },
  })

  useFrame((_, dt) => {
    if (!reduce && spinRef.current) spinRef.current.rotation.y += dt * 0.9
  })

  return (
    <group rotation={[0.22, 0, -0.52]}>
      <Float enabled={!reduce} speed={1.6} rotationIntensity={0.35} floatIntensity={0.55}>
        <animated.group ref={spinRef} scale={scale}>
          <mesh geometry={geo} material={mat} rotation={[0.12, 0, Math.PI / 2]} />
        </animated.group>
      </Float>
    </group>
  )
}

export default function Pill3D({ size = 208 }: { size?: number }) {
  const reduce = useMemo(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    [],
  )
  return (
    <div style={{ width: size, height: size }} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.4, 6.6], fov: 38 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        frameloop={reduce ? 'demand' : 'always'}
      >
        <ambientLight intensity={0.5} />
        <Environment resolution={128}>
          <Lightformer form="rect" intensity={2.2} position={[3, 4, 5]} scale={[6, 6, 1]} />
          <Lightformer form="rect" intensity={1.1} color="#d6f5ee" position={[-5, -1, -3]} scale={[5, 5, 1]} />
          <Lightformer form="ring" intensity={1.6} position={[0, 2, 4]} scale={3} />
        </Environment>
        <Capsule reduce={reduce} />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.34} blur={2.6} scale={7} far={3} color="#0b8f7c" />
        {!reduce && (
          <Sparkles count={16} scale={[4, 4, 2]} size={2.2} speed={0.35} color="#1fd0b1" opacity={0.55} />
        )}
      </Canvas>
    </div>
  )
}
