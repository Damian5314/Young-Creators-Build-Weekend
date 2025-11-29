import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/lib/hooks';

// Pages
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import Cook from '@/pages/Cook';
import Collections from '@/pages/Collections';
import Profile from '@/pages/Profile';
import Map from '@/pages/Map';
import Onboarding from '@/pages/Onboarding';
import Restaurant from '@/pages/Restaurant';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';

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
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/map" element={<Map />} />
            <Route path="/cook" element={<Cook />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/profile" element={<Profile />} />

            {/* Detail pages */}
            <Route path="/restaurant/:id" element={<Restaurant />} />

            {/* Dashboard */}
            <Route path="/dashboard/restaurant" element={<Dashboard />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
