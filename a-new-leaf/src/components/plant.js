import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, ContactShadows, Environment } from '@react-three/drei'
import { useControls } from 'leva'

const MODELS = {
  Jade: 'plant1.gltf',
  JacobsLadder: 'plant2.gltf',
  Snake: 'plant3.gltf'
}

export default function Plant() {
  const { model } = useControls({ model: { value: 'Snake', options: Object.keys(MODELS) } })
  return (
    <>
      <Canvas camera={{ position: [0, 10, 10], fov: 10 }}>
        <hemisphereLight color="white" groundColor="blue" intensity={0.75} />
        <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} />
        <group position={[0, 0, 0]}>
          <Model position={[0, 0.0, 0]} url={MODELS[model]} />
          <ContactShadows scale={8} blur={5} far={10} />
        </group>
        <OrbitControls autoRotate enableZoom={false} enablePan={false}/>
      </Canvas>
    </>
  )
}

function Model({ url, ...props }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} {...props} />
}
