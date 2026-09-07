import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AccessibilityWidget } from './components/AccessibilityWidget';
import { MascotWidget } from './components/MascotWidget';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Devices } from './pages/Devices';
import { DeviceForm } from './pages/DeviceForm';
import { DeviceSniffer } from './pages/DeviceSniffer';
import { Usage } from './pages/Usage';
import { Dashboard } from './pages/Dashboard';
import { CarbonFootprint } from './pages/CarbonFootprint';
import { Recommendations } from './pages/Recommendations';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Guide } from './pages/Guide';
import { GreonSpace } from './pages/GreonSpace';

export default function App() {
  return (
    <AccessibilityProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <AppDataProvider>
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
                path="/greon"
                element={
                  <ProtectedRoute>
                    <GreonSpace />
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
                path="/dispositivos/sniffer"
                element={
                  <ProtectedRoute>
                    <DeviceSniffer />
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
              <Route
                path="/estadisticas"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/huella-carbono"
                element={
                  <ProtectedRoute>
                    <CarbonFootprint />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recomendaciones"
                element={
                  <ProtectedRoute>
                    <Recommendations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reportes"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/configuracion"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guia"
                element={
                  <ProtectedRoute>
                    <Guide />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <MascotWidget />
          </AppDataProvider>
        </AuthProvider>
      </BrowserRouter>
      <AccessibilityWidget />
    </AccessibilityProvider>
  );
}
