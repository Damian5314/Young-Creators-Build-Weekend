import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, Store, UserCircle, MapPin, Building2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/shared/hooks';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email('Voer een geldig e-mailadres in'),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 tekens zijn'),
  name: z.string().min(2, 'Naam moet minimaal 2 tekens zijn'),
});

const restaurantSchema = z.object({
  email: z.string().email('Voer een geldig e-mailadres in'),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 tekens zijn'),
  name: z.string().min(2, 'Naam moet minimaal 2 tekens zijn'),
  restaurantName: z.string().min(2, 'Restaurantnaam moet minimaal 2 tekens zijn'),
  kvkNumber: z.string().min(8, 'KVK-nummer moet 8 cijfers zijn').max(8, 'KVK-nummer moet 8 cijfers zijn'),
  address: z.string().min(5, 'Voer een geldig adres in'),
  city: z.string().min(2, 'Voer een geldige stad in'),
});

type AccountType = 'user' | 'restaurant' | null;

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    restaurantName: '',
    kvkNumber: '',
    address: '',
    city: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user && !authLoading) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed, role')
          .eq('id', user.id)
          .single();

        if (profile?.onboarding_completed) {
          navigate('/');
        } else if (profile?.role === 'OWNER') {
          // Restaurant owners skip onboarding - mark as completed and go home
          await supabase
            .from('profiles')
            .update({ onboarding_completed: true })
            .eq('id', user.id);
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
        z.object({
          email: z.string().email('Voer een geldig e-mailadres in'),
          password: z.string().min(6, 'Wachtwoord moet minimaal 6 tekens zijn'),
        }).parse(formData);
      } else if (accountType === 'user') {
        userSchema.parse(formData);
      } else if (accountType === 'restaurant') {
        restaurantSchema.parse(formData);
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
            ? 'Ongeldige e-mail of wachtwoord'
            : error.message
        );
      } else {
        toast.success('Welkom terug!');
      }
    } else {
      const role = accountType === 'restaurant' ? 'OWNER' : 'USER';
      const restaurantData = accountType === 'restaurant' ? {
        name: formData.restaurantName,
        kvkNumber: formData.kvkNumber,
        address: formData.address,
        city: formData.city,
        cuisineTypes: [],
      } : undefined;

      const { error } = await signUp(formData.email, formData.password, formData.name, role, restaurantData);
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Dit e-mailadres is al geregistreerd. Probeer in te loggen.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Account aangemaakt! Je profiel wordt ingesteld...');
      }
    }

    setLoading(false);
  };

  const resetToSignup = () => {
    setAccountType(null);
    setFormData({
      email: '',
      password: '',
      name: '',
      restaurantName: '',
      kvkNumber: '',
      address: '',
      city: '',
    });
    setErrors({});
  };

  // Account type selection screen
  const renderAccountTypeSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-center mb-6">Wat voor account wil je?</h2>

      <button
        onClick={() => setAccountType('user')}
        className="w-full p-6 rounded-2xl bg-secondary hover:bg-secondary/80 transition-all flex items-center gap-4 group"
      >
        <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <UserCircle className="h-7 w-7 text-primary" />
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-lg">Gebruiker</h3>
          <p className="text-sm text-muted-foreground">Ontdek restaurants en deel recepten</p>
        </div>
        <ArrowRight className="h-5 w-5 ml-auto text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>

      <button
        onClick={() => setAccountType('restaurant')}
        className="w-full p-6 rounded-2xl bg-secondary hover:bg-secondary/80 transition-all flex items-center gap-4 group"
      >
        <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Store className="h-7 w-7 text-primary" />
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-lg">Restaurant</h3>
          <p className="text-sm text-muted-foreground">Promoot je restaurant met video's</p>
        </div>
        <ArrowRight className="h-5 w-5 ml-auto text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>
    </motion.div>
  );

  // User signup form
  const renderUserForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <button
        onClick={resetToSignup}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="text-sm">Terug</span>
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <UserCircle className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Gebruiker Account</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Je naam"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="pl-12 h-14 bg-secondary border-0 rounded-xl text-base"
            />
          </div>
          {errors.name && <p className="text-destructive text-sm mt-2 pl-1">{errors.name}</p>}
        </div>

        <div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="E-mailadres"
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
              placeholder="Wachtwoord"
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
          {errors.password && <p className="text-destructive text-sm mt-2 pl-1">{errors.password}</p>}
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
              Account Aanmaken
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );

  // Restaurant signup form
  const renderRestaurantForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <button
        onClick={resetToSignup}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="text-sm">Terug</span>
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Store className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Restaurant Account</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal info */}
        <p className="text-sm text-muted-foreground font-medium">Persoonlijke gegevens</p>

        <div>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Je naam"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="pl-12 h-14 bg-secondary border-0 rounded-xl text-base"
            />
          </div>
          {errors.name && <p className="text-destructive text-sm mt-2 pl-1">{errors.name}</p>}
        </div>

        <div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="E-mailadres"
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
              placeholder="Wachtwoord"
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
          {errors.password && <p className="text-destructive text-sm mt-2 pl-1">{errors.password}</p>}
        </div>

        {/* Restaurant info */}
        <p className="text-sm text-muted-foreground font-medium pt-4">Restaurant gegevens</p>

        <div>
          <div className="relative">
            <Store className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Restaurantnaam"
              value={formData.restaurantName}
              onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
              className="pl-12 h-14 bg-secondary border-0 rounded-xl text-base"
            />
          </div>
          {errors.restaurantName && <p className="text-destructive text-sm mt-2 pl-1">{errors.restaurantName}</p>}
        </div>

        <div>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="KVK-nummer (8 cijfers)"
              value={formData.kvkNumber}
              onChange={(e) => setFormData({ ...formData, kvkNumber: e.target.value.replace(/\D/g, '').slice(0, 8) })}
              className="pl-12 h-14 bg-secondary border-0 rounded-xl text-base"
            />
          </div>
          {errors.kvkNumber && <p className="text-destructive text-sm mt-2 pl-1">{errors.kvkNumber}</p>}
        </div>

        <div>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Adres"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="pl-12 h-14 bg-secondary border-0 rounded-xl text-base"
            />
          </div>
          {errors.address && <p className="text-destructive text-sm mt-2 pl-1">{errors.address}</p>}
        </div>

        <div>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Stad"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="pl-12 h-14 bg-secondary border-0 rounded-xl text-base"
            />
          </div>
          {errors.city && <p className="text-destructive text-sm mt-2 pl-1">{errors.city}</p>}
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
              Restaurant Registreren
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );

  // Login form
  const renderLoginForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="E-mailadres"
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
              placeholder="Wachtwoord"
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
          {errors.password && <p className="text-destructive text-sm mt-2 pl-1">{errors.password}</p>}
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
              Inloggen
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="h-20 w-20 mx-auto mb-5 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-4xl">🍕</span>
            </div>
            <h1 className="text-4xl font-display font-bold gradient-text mb-2">FoodSwipe</h1>
            <p className="text-muted-foreground">Ontdek lekker eten bij jou in de buurt</p>
          </div>

          {/* Toggle */}
          <div className="flex p-1.5 bg-secondary rounded-2xl mb-8">
            <button
              onClick={() => {
                setIsLogin(true);
                setAccountType(null);
              }}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                isLogin
                  ? 'bg-card text-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Inloggen
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setAccountType(null);
              }}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                !isLogin
                  ? 'bg-card text-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Registreren
            </button>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {isLogin ? (
              renderLoginForm()
            ) : accountType === null ? (
              renderAccountTypeSelection()
            ) : accountType === 'user' ? (
              renderUserForm()
            ) : (
              renderRestaurantForm()
            )}
          </AnimatePresence>

          {/* Demo accounts */}
          <div className="mt-8 p-4 rounded-2xl bg-primary/5 border border-primary/20">
            <p className="text-sm font-semibold text-primary mb-2">Demo Accounts</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <span className="text-foreground font-medium">Gebruiker:</span> user@demo.com / demo123
              </p>
              <p>
                <span className="text-foreground font-medium">Restaurant:</span> owner@demo.com / demo123
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
