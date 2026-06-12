'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface Card3DProps {
  word: string;
  isRevealed: boolean;
  isImposter: boolean;
}

export default function Card3D({ word, isRevealed, isImposter }: Card3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = isRevealed ? Math.PI : 0;

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Smoothly interpolate rotation towards target
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        targetRotation,
        4,
        delta
      );
    }
  });

  return (
    <group ref={groupRef}>
      <RoundedBox args={[2.5, 3.8, 0.1]} radius={0.15} smoothness={4}>
        {/* Front Material (Dark with Logo) */}
        <meshStandardMaterial attach="material-0" color="#1E293B" roughness={0.4} metalness={0.2} />
        <meshStandardMaterial attach="material-1" color="#1E293B" roughness={0.4} metalness={0.2} />
        <meshStandardMaterial attach="material-2" color="#1E293B" roughness={0.4} metalness={0.2} />
        <meshStandardMaterial attach="material-3" color="#1E293B" roughness={0.4} metalness={0.2} />
        
        {/* Front Face (Index 4) - What they see initially */}
        <meshStandardMaterial attach="material-4" color="#0F172A" roughness={0.3} metalness={0.5} />
        
        {/* Back Face (Index 5) - The Secret Word */}
        <meshStandardMaterial attach="material-5" color={isImposter ? "#DC2626" : "#7C3AED"} roughness={0.2} metalness={0.1} />
      </RoundedBox>

      {/* Front Content */}
      <Html position={[0, 0, 0.06]} transform zIndexRange={[100, 0]} className="pointer-events-none select-none">
        <div className={`w-[230px] h-[360px] flex flex-col items-center justify-center p-6 text-center ${isRevealed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
          <div className="w-16 h-16 rounded-full border-4 border-primary/50 flex items-center justify-center mb-6 animate-pulse-glow">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
          </div>
          <h3 className="text-2xl font-black text-white tracking-widest uppercase opacity-80">HOLD TO REVEAL</h3>
        </div>
      </Html>

      {/* Back Content (Word) */}
      <Html position={[0, 0, -0.06]} transform rotation={[0, Math.PI, 0]} zIndexRange={[100, 0]} className="pointer-events-none select-none">
        <div className={`w-[230px] h-[360px] flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b ${isImposter ? 'from-danger/30' : 'from-primary/20'} to-transparent rounded-xl border ${isImposter ? 'border-danger/30' : 'border-white/20'} shadow-[inset_0_0_50px_rgba(255,255,255,0.1)] ${!isRevealed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 delay-150`}>
          {isImposter && <div className="text-danger text-sm uppercase tracking-widest font-black mb-2 animate-pulse">YOU ARE THE IMPOSTER</div>}
          <div className="text-text-muted text-sm uppercase tracking-widest font-bold mb-4">{isImposter ? 'Your Hint' : 'Your Word'}</div>
          <h2 className={`text-4xl font-black ${isImposter ? 'text-white' : 'text-white'} break-words w-full px-2`} style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            {word}
          </h2>
        </div>
      </Html>
    </group>
  );
}
