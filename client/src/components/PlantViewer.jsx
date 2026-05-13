import { Suspense, useRef, useMemo, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';

// Error boundary prevents 3D canvas crash from taking down the whole React tree
class CanvasErrorBoundary extends Component {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (this.state.error) return <div style={{ width: '100%', height: this.props.height, background: 'transparent' }} />;
    return this.props.children;
  }
}

function Model({ url, compact, yOffset = 0 }) {
  const { scene } = useGLTF(url);
  // Clone so each viewer gets its own scene graph — multiple viewers sharing the
  // same GLB URL (e.g. avatar + plant card) would otherwise fight over the same
  // Three.js Object3D and one canvas would go blank.
  const clone = useMemo(() => scene.clone(true), [scene]);
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4;
  });
  const scale = compact ? 2.2 : 1.4;
  const posY  = (compact ? -0.2 : -0.8) + yOffset;
  return <primitive ref={ref} object={clone} scale={scale} position={[0, posY, 0]} />;
}

export default function PlantViewer({ modelUrl, height = 200, compact = false, yOffset = 0 }) {
  const cameraPos = compact ? [0, 0.2, 1.6] : [0, 1, 3];
  const fov       = compact ? 55 : 45;
  return (
    <CanvasErrorBoundary height={height}>
      <div style={{ width: '100%', height, background: 'transparent' }}>
        <Canvas camera={{ position: cameraPos, fov }} gl={{ alpha: true }} style={{ background: 'transparent' }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Suspense fallback={null}>
            <Model key={modelUrl} url={modelUrl} compact={compact} yOffset={yOffset} />
            <Environment preset="apartment" />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  );
}
