import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/sonner';
import { SessionProvider } from './shared/auth/session';
import { RequireAuth } from './shared/auth/require-auth';
import { MockApiClient } from './shared/api/client';

// User-facing screens
import ExhibitPage from './pages/user/exhibit-page';
import LoadingScreen from './pages/user/loading-screen';
import NotFoundError from './pages/user/not-found-error';
import NetworkError from './pages/user/network-error';
import PlaybackError from './pages/user/playback-error';

// Admin screens
import AdminLogin from './pages/admin/login';
import AdminDashboard from './pages/admin/dashboard';
import ExhibitsList from './pages/admin/exhibits-list';
import ExhibitEdit from './pages/admin/exhibit-edit';
import ExhibitPreview from './pages/admin/exhibit-preview';
import MediaLibrary from './pages/admin/media-library';
import HallsManagement from './pages/admin/halls-management';

// Initialize API client (using mock for now)
const apiClient = new MockApiClient();

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="museum-theme">
      <SessionProvider apiClient={apiClient}>
        <BrowserRouter>
          <Routes>
            {/* Default route - start at admin dashboard */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* User routes */}
            <Route path="/exhibit/:id" element={<ExhibitPage />} />
            <Route path="/loading" element={<LoadingScreen />} />
            <Route path="/error/not-found" element={<NotFoundError />} />
            <Route path="/error/network" element={<NetworkError />} />
            <Route path="/error/playback" element={<PlaybackError />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <RequireAuth requiredPermission="dashboard.read">
                  <AdminDashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/exhibits"
              element={
                <RequireAuth requiredPermission="exhibits.read">
                  <ExhibitsList />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/exhibits/new"
              element={
                <RequireAuth requiredPermission="exhibits.write">
                  <ExhibitEdit />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/exhibits/:id"
              element={
                <RequireAuth requiredPermission="exhibits.write">
                  <ExhibitEdit />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/exhibits/:id/preview"
              element={
                <RequireAuth requiredPermission="exhibits.read">
                  <ExhibitPreview />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/media"
              element={
                <RequireAuth requiredPermission="media.read">
                  <MediaLibrary />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/halls"
              element={
                <RequireAuth requiredPermission="halls.read">
                  <HallsManagement />
                </RequireAuth>
              }
            />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </SessionProvider>
    </ThemeProvider>
  );
}
