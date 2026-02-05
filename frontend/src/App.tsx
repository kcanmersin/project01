import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LoginPage } from './pages/Login/LoginPage';
import { RegisterPage } from './pages/Register/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPassword/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPassword/ResetPasswordPage';
import { HomePage } from './pages/Home/HomePage';
import { MovieDetailPage } from './pages/MovieDetail/MovieDetailPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { PersonPage } from './pages/Person/PersonPage';
import { ListDetailPage } from './pages/ListDetail/ListDetailPage';
import { DiscoverPage } from './pages/Discover/DiscoverPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { SearchPage } from './pages/Search/SearchPage';
import { tokenStorage } from './services/api';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const currentUser = tokenStorage.getUser();

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route
            path="/profile"
            element={currentUser ? <Navigate to={`/profile/${currentUser.username}`} replace /> : <Navigate to="/login" replace />}
          />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/person/:id" element={<PersonPage />} />
          <Route path="/list/:id" element={<ListDetailPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App
