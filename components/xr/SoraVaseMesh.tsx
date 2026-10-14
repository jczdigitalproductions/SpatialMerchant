"use client";

import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { MoleculeAtom, VaseProduct } from "@/lib/catalog";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

interface SoraVaseMeshProps {
  product: VaseProduct;
  activeFinish: { name: string; hex: string; roughness: number; metalness: number };
  scaleMultiplier: number;
  autoRotate: boolean;
  showDimensions: boolean;
}

const ELEMENT_COLORS: Record<MoleculeAtom["element"], string> = {
  C: "#525a63",
  N: "#3767e8",
  O: "#e64949",
  H: "#f3f4f6",
  S: "#e6cc3d",
  P: "#eb873a",
  F: "#55b878",
  Cl: "#54a84a",
};

function MoleculeBond({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const { midpoint, quaternion, length } = useMemo(() => {
    const from = new THREE.Vector3(...start);
    const to = new THREE.Vector3(...end);
    const direction = to.clone().sub(from);
    return {
      midpoint: from.add(to).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().normalize(),
      ),
      length: direction.length(),
    };
  }, [start, end]);

  return (
    <mesh position={midpoint} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[0.009, 0.009, length, 10]} />
      <meshStandardMaterial color="#a9c7bc" metalness={0.58} roughness={0.3} />
    </mesh>
  );
}

function MoleculeModel({ product }: { product: VaseProduct }) {
  const atoms = product.atoms ?? [];
  const bonds = product.bonds ?? [];
  return (
    <group>
      {bonds.map(([fromIndex, toIndex], index) => {
        const from = atoms[fromIndex];
        const to = atoms[toIndex];
        if (!from || !to) return null;
        return (
          <MoleculeBond
            key={`bond-${index}`}
            start={from.position}
            end={to.position}
          />
        );
      })}
      {atoms.map((atom, index) => (
        <mesh key={`${atom.id}-${index}`} position={atom.position} castShadow>
          <sphereGeometry args={[atom.radius, 24, 16]} />
          <meshPhysicalMaterial
            color={ELEMENT_COLORS[atom.element]}
            roughness={0.2}
            metalness={0.18}
            clearcoat={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function SoraVaseMesh({
  product,
  activeFinish,
  scaleMultiplier,
  autoRotate,
  showDimensions,
}: SoraVaseMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const latheGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 60;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = (t - 0.5) * 0.42;

      let radius = 0.08;
      if (product.profile === "ribbed-amphora") {
        radius = 0.055 + Math.sin(t * Math.PI) * 0.075 + Math.sin(t * Math.PI * 12) * 0.004;
      } else if (product.profile === "twisted-torus") {
        radius = 0.07 + Math.cos(t * Math.PI * 1.6) * 0.035 + Math.pow(t, 3) * 0.04;
      } else {
        radius = 0.045 + Math.sin(Math.pow(t, 0.7) * Math.PI) * 0.095;
      }

      points.push(new THREE.Vector2(Math.max(0.02, radius), y));
    }

    return new THREE.LatheGeometry(points, 64);
  }, [product.profile]);
  const isMolecule = product.kind === "molecule";

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <group position={[0, 1.15, -0.9]} scale={scaleMultiplier}>
      <group
        ref={groupRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {isMolecule ? (
          <MoleculeModel product={product} />
        ) : (
          <>
            <mesh geometry={latheGeometry} castShadow receiveShadow>
              <meshStandardMaterial
                color={activeFinish.hex}
                roughness={activeFinish.roughness}
                metalness={activeFinish.metalness}
                side={THREE.DoubleSide}
              />
            </mesh>

            <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.055, 32]} />
              <meshBasicMaterial color="#09090b" />
            </mesh>
          </>
        )}
      </group>

      <mesh position={[0, -0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12, 0.135, 64]} />
        <meshBasicMaterial
          color={hovered ? "#818cf8" : "#ffffff"}
          transparent
          opacity={hovered ? 0.8 : 0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {showDimensions && (
        <group position={[0.2, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.002, 0.42, 0.002]} />
            <meshBasicMaterial color="#818cf8" />
          </mesh>
          <Text
            position={[0.08, 0, 0]}
            fontSize={0.022}
            color="#e0e7ff"
            anchorX="left"
            anchorY="middle"
          >
            {product.dimensions}
          </Text>
        </group>
      )}
    </group>
  );
}
