'use client';

import { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Float, Html } from '@react-three/drei';
import Card3D from './Card3D';

interface CardSceneProps {
  word: string;
  isReady?: boolean;
  onViewed: () => void;
}

export default function CardScene({ word, isReady, onViewed }: CardSceneProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const handlePointerDown = () => {
    setIsRevealed(true);
    if (!isReady) {
      onViewed();
    }
  };

  const handlePointerUp = () => {
    setIsRevealed(false);
  };

  return (
    <div 
      className="w-full h-full min-h-[500px] relative cursor-pointer touch-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[-10, -10, -10]} intensity={0.5} color="#EC4899" />
        
        <Float
          speed={isRevealed ? 1 : 2} 
          rotationIntensity={isRevealed ? 0 : 0.5} 
          floatIntensity={isRevealed ? 0.5 : 2}
          floatingRange={[-0.1, 0.1]}
        >
          <Card3D word={word} isRevealed={isRevealed} />
        </Float>
      </Canvas>
    </div>
  );
}
