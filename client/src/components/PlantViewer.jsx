import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';

function Model({ url, compact }) {
  const { scene } = useGLTF(url);
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4;
  });
  const scale = compact ? 2.2 : 1.4;
  const posY  = compact ? -0.2 : -0.8;
  return <primitive ref={ref} object={scene} scale={scale} position={[0, posY, 0]} />;
}

export default function PlantViewer({ modelUrl, height = 200, compact = false }) {
  const cameraPos = compact ? [0, 0.2, 1.6] : [0, 1, 3];
  const fov       = compact ? 55 : 45;
  return (
    <div style={{ width: '100%', height, background: 'transparent' }}>
      <Canvas camera={{ position: cameraPos, fov }} gl={{ alpha: true }} style={{ background: 'transparent' }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Model url={modelUrl} compact={compact} />
          <Environment preset="apartment" />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
