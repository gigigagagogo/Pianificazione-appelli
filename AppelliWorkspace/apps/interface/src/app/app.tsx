// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import LoginPage from './login/login-page';
import RegisterPage from './register/register-page';
import AppelliPage from './appelli/appelli-page';
import AddAppelloPage from './appelli/add-appello-page';
import SegreteriaPage from './segreteria/segreteria-page';
import ProtectedRoute from './shared/protected-route';

import { Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/appelli"
        element={
          <ProtectedRoute allowedRole="docente">
            <AppelliPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/appelli/nuovo"
        element={
          <ProtectedRoute allowedRole="docente">
            <AddAppelloPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/segreteria"
        element={
          <ProtectedRoute allowedRole="segreteria">
            <SegreteriaPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;