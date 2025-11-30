import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/shared/hooks';

// Feature pages
import {
  HomePage,
  AuthPage,
  CookPage,
  CollectionsPage,
  ProfilePage,
  MapPage,
  OnboardingPage,
  RestaurantDetailPage,
  DashboardPage,
  UploadPage,
} from '@/features';

// Not Found page
import NotFoundPage from '@/features/NotFoundPage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Main pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/cook" element={<CookPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/upload" element={<UploadPage />} />

            {/* Detail pages */}
            <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />

            {/* Dashboard */}
            <Route path="/dashboard/restaurant" element={<DashboardPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
