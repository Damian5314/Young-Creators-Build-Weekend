import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Check, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const DIETARY_OPTIONS = [
  { id: 'halal', label: 'Halal', emoji: '🥩' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { id: 'spicy', label: 'Spicy', emoji: '🌶️' },
  { id: 'gluten-free', label: 'Gluten-free', emoji: '🌾' },
  { id: 'dairy-free', label: 'Dairy-free', emoji: '🥛' },
];

const CITIES = [
  'Rotterdam',
  'Amsterdam',
  'The Hague',
  'Utrecht',
  'Eindhoven',
  'Other',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [city, setCity] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const togglePreference = (pref: string) => {
    setPreferences(prev => 
      prev.includes(pref) 
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
    );
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const finalCity = city === 'Other' ? customCity : city;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        city: finalCity,
        dietary_preferences: preferences,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to save preferences');
    } else {
      await refreshProfile();
      toast.success('Welcome to FoodSwipe!');
      navigate('/');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-secondary">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: '0%' }}
          animate={{ width: step === 1 ? '50%' : '100%' }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="text-center"
              >
                <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                
                <h1 className="text-2xl font-display font-bold mb-2">
                  Where are you located?
                </h1>
                <p className="text-muted-foreground mb-8">
                  We'll show you the best food spots nearby
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {CITIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCity(c)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        city === c 
                          ? 'border-primary bg-primary/10' 
                          : 'border-secondary bg-secondary/50 hover:border-primary/50'
                      }`}
                    >
                      <span className="font-semibold">{c}</span>
                    </button>
                  ))}
                </div>

                {city === 'Other' && (
                  <Input
                    placeholder="Enter your city..."
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className="mb-6"
                  />
                )}

                <Button 
                  onClick={() => setStep(2)}
                  disabled={!city || (city === 'Other' && !customCity)}
                  className="w-full"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="text-center"
              >
                <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl">🍽️</span>
                </div>
                
                <h1 className="text-2xl font-display font-bold mb-2">
                  Any dietary preferences?
                </h1>
                <p className="text-muted-foreground mb-8">
                  Select all that apply (optional)
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {DIETARY_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => togglePreference(option.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                        preferences.includes(option.id)
                          ? 'border-primary bg-primary/10' 
                          : 'border-secondary bg-secondary/50 hover:border-primary/50'
                      }`}
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="font-semibold">{option.label}</span>
                      {preferences.includes(option.id) && (
                        <Check className="h-5 w-5 text-primary ml-auto" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="secondary"
                    onClick={() => setStep(1)}
                    className="flex-1"
                    size="lg"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleComplete}
                    disabled={loading}
                    className="flex-1"
                    size="lg"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Start Exploring
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
