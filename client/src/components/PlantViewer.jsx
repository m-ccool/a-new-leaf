import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';

function resolveAssetUrl(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  const base = process.env.PUBLIC_URL || '';
  if (base && url.startsWith(`${base}/`)) return url;
  if (url.startsWith('/')) return `${base}${url}`;
  return `${base}/${url}`;
}

function Model({ url, compact }) {
  const { scene } = useGLTF(resolveAssetUrl(url));
  // Clone so each viewer gets its own scene graph — multiple viewers sharing the
  // same GLB URL (e.g. avatar + plant card) would otherwise fight over the same
  // Three.js Object3D and one canvas would go blank.
  const clone = useMemo(() => scene.clone(true), [scene]);
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4;
  });
  const scale = compact ? 2.2 : 1.4;
  const posY  = compact ? -0.2 : -0.8;
  return <primitive ref={ref} object={clone} scale={scale} position={[0, posY, 0]} />;
}

export default function PlantViewer({ modelUrl, height = 200, compact = false }) {
  const cameraPos = compact ? [0, 0.2, 1.6] : [0, 1, 3];
  const fov       = compact ? 55 : 45;
  return (
    <div style={{ width: '100%', height, background: 'transparent', position: 'relative', zIndex: 1, transform: 'translateZ(0)', isolation: 'isolate' }}>
      <Canvas camera={{ position: cameraPos, fov }} gl={{ alpha: true }} style={{ background: 'transparent' }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Model key={modelUrl} url={modelUrl} compact={compact} />
          <Environment preset="apartment" />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
