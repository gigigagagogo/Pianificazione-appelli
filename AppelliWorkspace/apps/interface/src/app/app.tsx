// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import LoginPage from './login/login-page';
import RegisterPage from './register/register-page';

import { Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default App;


