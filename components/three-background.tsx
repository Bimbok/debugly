"use client"

import { Canvas } from "@react-three/fiber"
import { Environment, Float, Stars } from "@react-three/drei"
import { Suspense } from "react"

export function ThreeBackground() {
  return (
    <Canvas className="w-full h-screen" camera={{ position: [0, 0, 8], fov: 60 }}>
      <color attach="background" args={["#0b0f14"]} />
      <Suspense fallback={null}>
        <Stars radius={70} depth={50} count={4000} factor={2} fade speed={1} />
        <Float floatIntensity={1} rotationIntensity={0.3} speed={1.2}>
          <mesh>
            <torusKnotGeometry args={[1.2, 0.3, 128, 32]} />
            <meshStandardMaterial color={"#12b9c6"} metalness={0.2} roughness={0.4} wireframe />
          </mesh>
        </Float>
        <Environment preset="city" />
      </Suspense>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
    </Canvas>
  )
}
