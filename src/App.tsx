import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/useAuthStore';

// Layouts & Protected Route
import { AuthLayout } from './components/layout/AuthLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/public/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { UserDashboard } from './pages/user/Dashboard';
import { PetsList } from './pages/user/PetsList';
import { PetForm } from './pages/user/PetForm';
import { PetProfile } from './pages/user/PetProfile';
import { UserAlerts } from './pages/user/UserAlerts';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CameraManager } from './pages/admin/CameraManager';
import { AdminAlerts } from './pages/admin/AdminAlerts';

function App() {
  const { setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrowserRouter basename="/RastroPet">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected User Routes */}
        <Route 
          path="/app" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="pets" element={<PetsList />} />
          <Route path="pets/new" element={<PetForm />} />
          <Route path="pets/:id" element={<PetProfile />} />
          <Route path="alerts" element={<UserAlerts />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="cameras" element={<CameraManager />} />
          <Route path="alerts" element={<AdminAlerts />} />
          {/* Outras rotas do admin entrarão aqui futuramente */}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
