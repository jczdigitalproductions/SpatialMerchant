"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, Stage } from "@react-three/drei";
import { createXRStore, XR } from "@react-three/xr";
import type { Product, VaseProduct } from "@/lib/catalog";
import SoraVaseMesh from "./SoraVaseMesh";
import { Suspense, useMemo, useRef } from "react";
import { Quaternion, Vector3 } from "three";
import type { Group } from "three";

export const xrStore = createXRStore();

interface SoraVaseXRSceneProps {
  product: VaseProduct;
  activeFinish: { name: string; hex: string; roughness: number; metalness: number };
  scaleMultiplier: number;
  autoRotate: boolean;
  showDimensions: boolean;
}

export function SoraVaseXRScene({
  product,
  activeFinish,
  scaleMultiplier,
  autoRotate,
  showDimensions,
}: SoraVaseXRSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.3, 0.2], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      className="h-full w-full"
    >
      <XR store={xrStore}>
        <ambientLight intensity={0.7} />
        <spotLight
          position={[2, 3, 2]}
          angle={0.35}
          penumbra={1}
          intensity={2}
          castShadow
        />
        <directionalLight position={[-3, 2, -2]} intensity={0.9} />

        <Suspense fallback={null}>
          <Environment preset="studio" />
          <SoraVaseMesh
            product={product}
            activeFinish={activeFinish}
            scaleMultiplier={scaleMultiplier}
            autoRotate={autoRotate}
            showDimensions={showDimensions}
          />
          <ContactShadows
            position={[0, 0.93, -0.9]}
            opacity={0.5}
            scale={1.5}
            blur={2.2}
            far={1.2}
          />
        </Suspense>

        <OrbitControls
          target={[0, 1.15, -0.9]}
          enablePan={false}
          minDistance={0.4}
          maxDistance={2.2}
        />
      </XR>
    </Canvas>
  );
}

type Point3 = [number, number, number];

function MolecularBond({ start, end }: { start: Point3; end: Point3 }) {
  const { midpoint, quaternion, length } = useMemo(() => {
    const from = new Vector3(...start);
    const to = new Vector3(...end);
    const direction = to.clone().sub(from);
    return {
      midpoint: from.add(to).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(
        new Vector3(0, 1, 0),
        direction.clone().normalize(),
      ),
      length: direction.length(),
    };
  }, [start, end]);

  return (
    <mesh position={midpoint} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[0.045, 0.045, length, 16]} />
      <meshStandardMaterial color="#a9c7bc" metalness={0.72} roughness={0.24} />
    </mesh>
  );
}

const moleculeAtoms: { position: Point3; color: string; radius: number }[] = [
  { position: [0, 0.83, 0], color: "#d7fb71", radius: 0.27 },
  { position: [-0.82, 0.48, 0.12], color: "#8ed7dc", radius: 0.22 },
  { position: [0.78, 0.48, 0.16], color: "#e6a784", radius: 0.23 },
  { position: [-0.43, 1.28, -0.2], color: "#c4daf3", radius: 0.2 },
  { position: [0.45, 1.3, -0.15], color: "#e6a784", radius: 0.23 },
  { position: [-0.22, 0.48, 0.79], color: "#c4daf3", radius: 0.18 },
  { position: [0.3, 0.47, -0.76], color: "#8ed7dc", radius: 0.2 },
];

function MoleculeModel() {
  const center = moleculeAtoms[0].position;
  return (
    <group>
      {moleculeAtoms.slice(1).map((atom, index) => (
        <MolecularBond key={`bond-${index}`} start={center} end={atom.position} />
      ))}
      {moleculeAtoms.map((atom, index) => (
        <mesh key={`atom-${index}`} position={atom.position} castShadow>
          <sphereGeometry args={[atom.radius, 32, 24]} />
          <meshPhysicalMaterial
            color={atom.color}
            metalness={0.28}
            roughness={0.18}
            clearcoat={0.9}
            emissive={atom.color}
            emissiveIntensity={index === 0 ? 0.28 : 0.08}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.83, 0]} scale={1.85}>
        <sphereGeometry args={[0.27, 24, 24]} />
        <meshBasicMaterial color="#d7fb71" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

function ProductModel({ product }: { product: Product }) {
  const primary = product.color;
  const accent = product.accent;

  switch (product.model) {
    case "vase":
      return (
        <group>
          <mesh castShadow position={[0, 0.43, 0]} scale={[0.66, 1, 0.66]}>
            <sphereGeometry args={[0.52, 48, 32]} />
            <meshPhysicalMaterial color={primary} roughness={0.19} metalness={0.12} clearcoat={0.8} />
          </mesh>
          <mesh castShadow position={[0, 0.93, 0]}>
            <cylinderGeometry args={[0.19, 0.25, 0.34, 40]} />
            <meshPhysicalMaterial color={primary} roughness={0.19} metalness={0.12} clearcoat={0.8} />
          </mesh>
          <mesh position={[0, 0.84, 0]}>
            <torusGeometry args={[0.2, 0.025, 12, 48]} />
            <meshStandardMaterial color={accent} metalness={0.75} roughness={0.22} />
          </mesh>
          <mesh castShadow position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.25, 0.3, 0.12, 48]} />
            <meshStandardMaterial color={primary} roughness={0.24} />
          </mesh>
        </group>
      );
    case "headphones":
      return (
        <group rotation={[0, 0, -0.14]}>
          <mesh castShadow position={[0, 0.6, 0]}>
            <torusGeometry args={[0.68, 0.105, 24, 80, Math.PI]} />
            <meshStandardMaterial color={primary} roughness={0.27} metalness={0.38} />
          </mesh>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.67, 0.34, 0]}>
              <mesh castShadow>
                <capsuleGeometry args={[0.19, 0.32, 8, 24]} />
                <meshStandardMaterial color={primary} roughness={0.24} metalness={0.25} />
              </mesh>
              <mesh position={[0, 0, 0.12]}>
                <cylinderGeometry args={[0.13, 0.13, 0.06, 32]} />
                <meshStandardMaterial color={accent} metalness={0.82} roughness={0.2} />
              </mesh>
            </group>
          ))}
        </group>
      );
    case "lamp":
      return (
        <group>
          <mesh castShadow position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.52, 0.58, 0.16, 48]} />
            <meshStandardMaterial color={accent} metalness={0.78} roughness={0.22} />
          </mesh>
          <mesh castShadow position={[0, 0.66, 0]}>
            <cylinderGeometry args={[0.12, 0.15, 1.02, 32]} />
            <meshStandardMaterial color={primary} metalness={0.6} roughness={0.24} />
          </mesh>
          <mesh castShadow position={[0, 1.35, 0]}>
            <coneGeometry args={[0.68, 0.62, 48, 1, true]} />
            <meshStandardMaterial color={primary} side={2} metalness={0.38} roughness={0.25} />
          </mesh>
          <mesh position={[0, 1.08, 0]}>
            <sphereGeometry args={[0.13, 24, 24]} />
            <meshBasicMaterial color="#fff0bf" />
          </mesh>
          <pointLight position={[0, 1.1, 0]} color="#ffd996" intensity={1.4} distance={2.4} />
        </group>
      );
    case "sneaker":
      return (
        <group rotation={[0, -0.32, 0]}>
          <mesh castShadow position={[0, 0.25, 0]} scale={[1, 0.72, 0.62]}>
            <sphereGeometry args={[0.75, 48, 32]} />
            <meshStandardMaterial color={primary} roughness={0.66} />
          </mesh>
          <mesh castShadow position={[0.08, 0.06, 0]} scale={[1.16, 0.2, 0.72]}>
            <sphereGeometry args={[0.72, 48, 24]} />
            <meshStandardMaterial color="#e8e5dc" roughness={0.48} />
          </mesh>
          {[-0.14, 0, 0.14].map((y) => (
            <mesh key={y} position={[0.02, 0.38 + y, 0.36]}>
              <boxGeometry args={[0.52, 0.025, 0.035]} />
              <meshStandardMaterial color={accent} roughness={0.4} />
            </mesh>
          ))}
          <mesh position={[-0.3, 0.33, 0.39]} rotation={[0, 0, -0.25]}>
            <boxGeometry args={[0.22, 0.2, 0.025]} />
            <meshStandardMaterial color={accent} roughness={0.5} />
          </mesh>
        </group>
      );
    case "molecule":
      return <MoleculeModel />;
  }
}

export default function XRScene({
  product,
  rotation,
  scale,
}: {
  product: Product;
  rotation: number;
  scale: number;
}) {
  const group = useRef<Group>(null);

  return (
    <>
      <color attach="background" args={["#171a19"]} />
      <ambientLight intensity={0.8} />
      <directionalLight castShadow position={[3, 5, 4]} intensity={2.1} shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 2, -3]} intensity={1.1} color="#d7fbbe" />
      <Environment preset="city" />
      <Stage
        adjustCamera={false}
        shadows={false}
        environment={null}
        intensity={0.7}
        preset="soft"
        position={[0, -0.15, 0]}
      >
        <group ref={group} rotation={[0, rotation, 0]} scale={scale} position={[0, 0.06, 0]}>
          <ProductModel product={product} />
        </group>
      </Stage>
      <ContactShadows position={[0, -0.04, 0]} opacity={0.36} scale={5} blur={2.8} far={2.5} />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={2.5}
        maxDistance={8}
        minPolarAngle={Math.PI / 3.8}
        maxPolarAngle={Math.PI / 1.85}
        target={[0, 0.78, 0]}
      />
    </>
  );
}
