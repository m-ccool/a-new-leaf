import { Canvas } from '@react-three/fiber'
import Plant from './components/plant'
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
      <Plant />
    </>
  )
}

function Model({ url, ...props }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} {...props} />
}
