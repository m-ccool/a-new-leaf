import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, ContactShadows, Environment } from '@react-three/drei'
import { useControls } from 'leva'

const MODELS = {
  Jade: 'plant1.gltf',
  JacobsLadder: 'plant2.gltf',
  Snake: 'plant3.gltf'
}

export default function App() {
  const { model } = useControls({ model: { value: 'Snake', options: Object.keys(MODELS) } })
  return (
    <>
      <header>This is a {model.toLowerCase()} plant.</header>
      <Canvas camera={{ position: [-10, 5, 10], fov: 10 }}>
        <hemisphereLight color="white" groundColor="blue" intensity={0.75} />
        <spotLight position={[50, 50, 10]} angle={0.15} penumbra={1} />
        <group position={[0, 0, 0]}>
          <Model position={[0, 0.0, 0]} url={MODELS[model]} />
          <ContactShadows scale={10} blur={5} far={5} />
        </group>
        <OrbitControls />
      </Canvas>
    </>
  )
}

function Model({ url, ...props }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} {...props} />
}
