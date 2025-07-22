import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import { AnimationMixer, Object3D, Vector3, SkeletonHelper } from 'three';

interface ViewportProps {
  character: Object3D | null;
  mixerRef: React.RefObject<AnimationMixer | undefined>;
  skeleton: SkeletonHelper | null;
  skeletonEnabled: boolean;
  viewType: 'perspective' | 'top' | 'side' | 'front';
  label: string;
}

const ViewportContent: React.FC<Omit<ViewportProps, 'label'>> = ({ 
  character, 
  mixerRef, 
  skeleton, 
  skeletonEnabled, 
  viewType 
}) => {
  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  const getCameraPosition = () => {
    switch (viewType) {
      case 'top':
        return [0, 5, 0.01] as [number, number, number];
      case 'side':
        return [5, 1, 0] as [number, number, number];
      case 'front':
        return [0, 1, 5] as [number, number, number];
      default: // perspective
        return [1.5, 1, 2.5] as [number, number, number];
    }
  };

  const getCameraRotation = () => {
    switch (viewType) {
      case 'top':
        return [-Math.PI / 2, 0, 0] as [number, number, number];
      default:
        return [0, 0, 0] as [number, number, number];
    }
  };

  return (
    <>
      {viewType === 'perspective' ? (
        <PerspectiveCamera 
          makeDefault 
          position={getCameraPosition()} 
          fov={75}
        />
      ) : (
        <OrthographicCamera
          makeDefault
          position={getCameraPosition()}
          rotation={getCameraRotation()}
          zoom={150}
          near={-1000}
          far={1000}
        />
      )}
      
      {viewType === 'perspective' && (
        <OrbitControls 
          enableRotate={true}
          enablePan={true}
          enableZoom={true}
        />
      )}

      <ambientLight intensity={0.5} />
      <directionalLight
        color={0xffffff}
        intensity={0.8}
        position={[0.8, 1.4, 1.0]}
      />

      {character && (
        <primitive object={character} scale={[0.005, 0.005, 0.005]} />
      )}

      <gridHelper
        args={[10, 20, 0x444444, 0x444444]}
        position={[0, -0.01, 0]}
      />

      {skeletonEnabled && skeleton && <primitive object={skeleton} />}
    </>
  );
};

const Viewport: React.FC<ViewportProps> = ({ 
  character, 
  mixerRef, 
  skeleton, 
  skeletonEnabled, 
  viewType, 
  label 
}) => {
  return (
    <div className="relative h-60 bg-[#414141] rounded-sm border border-neutral-400 overflow-hidden">
      <Canvas
        camera={viewType === 'perspective' ? {
          fov: 75,
          position: getCameraPosition()
        } : undefined}
      >
        <ViewportContent 
          character={character}
          mixerRef={mixerRef}
          skeleton={skeleton}
          skeletonEnabled={skeletonEnabled}
          viewType={viewType}
        />
      </Canvas>
      <div className="absolute top-0 left-0 bg-white px-2 py-1">
        <span className="text-xs text-neutral-900">{label}</span>
      </div>
    </div>
  );
};

interface FourViewportsProps {
  character: Object3D | null;
  mixerRef: React.RefObject<AnimationMixer | undefined>;
  skeleton: SkeletonHelper | null;
  skeletonEnabled: boolean;
}

const FourViewports: React.FC<FourViewportsProps> = ({ 
  character, 
  mixerRef, 
  skeleton, 
  skeletonEnabled 
}) => {
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-1 h-[486px] w-full">
      <Viewport
        character={character}
        mixerRef={mixerRef}
        skeleton={skeleton}
        skeletonEnabled={skeletonEnabled}
        viewType="perspective"
        label="perspective"
      />
      <Viewport
        character={character}
        mixerRef={mixerRef}
        skeleton={skeleton}
        skeletonEnabled={skeletonEnabled}
        viewType="top"
        label="top"
      />
      <Viewport
        character={character}
        mixerRef={mixerRef}
        skeleton={skeleton}
        skeletonEnabled={skeletonEnabled}
        viewType="side"
        label="side"
      />
      <Viewport
        character={character}
        mixerRef={mixerRef}
        skeleton={skeleton}
        skeletonEnabled={skeletonEnabled}
        viewType="front"
        label="front"
      />
    </div>
  );
};

export default FourViewports;