import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LoginPage } from './pages/Login/LoginPage';
import { RegisterPage } from './pages/Register/RegisterPage';
import { HomePage } from './pages/Home/HomePage';
import { MovieDetailPage } from './pages/MovieDetail/MovieDetailPage';
import { ProfilePage } from './pages/Profile/ProfilePage';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App
