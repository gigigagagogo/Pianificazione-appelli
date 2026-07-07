// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import LoginPage from './login/login-page';
import RegisterPage from './register/register-page';
import AppelliPage from './appelli/appelli-page';
import AddAppelloPage from './appelli/add-appello-page';

import { Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/appelli" element={<AppelliPage />} />
      <Route path="/appelli/nuovo" element={<AddAppelloPage />} />
    </Routes>
  );
}

export default App;


