import './styles/app.css';
import { PlantProvider } from './context/PlantContext';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <PlantProvider>
      <HomePage />
    </PlantProvider>
  );
}
