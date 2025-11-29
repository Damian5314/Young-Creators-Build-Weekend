import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/shared/hooks';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user && !authLoading) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (profile?.onboarding_completed) {
          navigate('/');
        } else {
          navigate('/onboarding');
        }
      }
    };

    checkOnboardingStatus();
  }, [user, authLoading, navigate]);

  const validateForm = () => {
    try {
      if (isLogin) {
        authSchema.pick({ email: true, password: true }).parse(formData);
      } else {
        authSchema.parse({ ...formData, name: formData.name || undefined });
      }
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) {
            newErrors[e.path[0] as string] = e.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        toast.error(
          error.message === 'Invalid login credentials'
            ? 'Invalid email or password'
            : error.message
        );
      } else {
        toast.success('Welcome back!');
        // Navigation happens in useEffect after user state updates
      }
    } else {
      const { error } = await signUp(formData.email, formData.password, formData.name);
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Try logging in.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email to confirm your account, or contact support.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Account created! Setting up your profile...');
        // Navigation happens in useEffect after user state updates
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="h-20 w-20 mx-auto mb-5 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-4xl">🍕</span>
            </div>
            <h1 className="text-4xl font-display font-bold gradient-text mb-2">FoodSwipe</h1>
            <p className="text-muted-foreground">Discover amazing food near you</p>
          </div>

          {/* Toggle */}
          <div className="flex p-1.5 bg-secondary rounded-2xl mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                isLogin
                  ? 'bg-card text-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                !isLogin
                  ? 'bg-card text-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-12 h-14 bg-secondary border-0 rounded-xl text-base"
                  />
                </div>
                {errors.name && <p className="text-destructive text-sm mt-2 pl-1">{errors.name}</p>}
              </motion.div>
            )}

            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-12 h-14 bg-secondary border-0 rounded-xl text-base"
                />
              </div>
              {errors.email && <p className="text-destructive text-sm mt-2 pl-1">{errors.email}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-12 pr-12 h-14 bg-secondary border-0 rounded-xl text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-sm mt-2 pl-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-base font-semibold mt-2"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-10 p-4 rounded-2xl bg-primary/5 border border-primary/20">
            <p className="text-sm font-semibold text-primary mb-2">Demo Accounts</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <span className="text-foreground font-medium">User:</span> user@demo.com / demo123
              </p>
              <p>
                <span className="text-foreground font-medium">Owner:</span> owner@demo.com / demo123
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
