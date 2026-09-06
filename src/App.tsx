import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Devices } from './pages/Devices';
import { DeviceForm } from './pages/DeviceForm';
import { Usage } from './pages/Usage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dispositivos"
            element={
              <ProtectedRoute>
                <Devices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dispositivos/nuevo"
            element={
              <ProtectedRoute>
                <DeviceForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dispositivos/:id/editar"
            element={
              <ProtectedRoute>
                <DeviceForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrar-uso"
            element={
              <ProtectedRoute>
                <Usage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
