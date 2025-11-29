import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, MapPin, Settings, LogOut, ChevronRight, Store, Check, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const DIETARY_OPTIONS = [
  { id: 'halal', label: 'Halal', emoji: '🥩' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { id: 'spicy', label: 'Spicy', emoji: '🌶️' },
  { id: 'gluten-free', label: 'Gluten-free', emoji: '🌾' },
  { id: 'dairy-free', label: 'Dairy-free', emoji: '🥛' },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    city: profile?.city || '',
    dietary_preferences: profile?.dietary_preferences || [],
  });

  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-2">Sign in to view profile</h1>
          <p className="text-muted-foreground mb-6">
            Manage your preferences and saved items
          </p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </AppLayout>
    );
  }

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        name: formData.name,
        city: formData.city,
        dietary_preferences: formData.dietary_preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to save changes');
    } else {
      await refreshProfile();
      toast.success('Profile updated!');
      setEditing(false);
    }

    setSaving(false);
  };

  const togglePreference = (pref: string) => {
    setFormData(prev => ({
      ...prev,
      dietary_preferences: prev.dietary_preferences.includes(pref)
        ? prev.dietary_preferences.filter(p => p !== pref)
        : [...prev.dietary_preferences, pref]
    }));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
    toast.success('Signed out successfully');
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-4 pb-24">
        {/* Header */}
        <div className="pt-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-display font-bold">Profile</h1>
            {!editing ? (
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                <Settings className="h-4 w-4 mr-1" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            )}
          </div>

          {/* Avatar and basic info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-foreground">
                {(profile?.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </span>
            </div>
            <div>
              {editing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  className="mb-2"
                />
              ) : (
                <h2 className="text-xl font-bold">{profile?.name || 'User'}</h2>
              )}
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </h3>
          {editing ? (
            <Input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Your city"
            />
          ) : (
            <p className="text-foreground">{profile?.city || 'Not set'}</p>
          )}
        </div>

        {/* Dietary preferences */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            Dietary Preferences
          </h3>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((option) => {
              const isSelected = formData.dietary_preferences.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => editing && togglePreference(option.id)}
                  disabled={!editing}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground'
                  } ${!editing && 'opacity-70'}`}
                >
                  <span>{option.emoji}</span>
                  {option.label}
                  {isSelected && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Owner dashboard link */}
        {profile?.role === 'OWNER' && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/dashboard/restaurant')}
            className="w-full p-4 mb-4 rounded-xl bg-card border border-border flex items-center gap-4"
          >
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold">Restaurant Dashboard</h3>
              <p className="text-sm text-muted-foreground">Manage your restaurants</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </motion.button>
        )}

        {/* Recommendation explanation */}
        <div className="bg-secondary/50 rounded-xl p-4 mb-8">
          <h3 className="font-semibold mb-2">How Recommendations Work</h3>
          <p className="text-sm text-muted-foreground">
            FoodSwipe uses your location and dietary preferences to show you relevant restaurants. 
            We prioritize trending content and restaurants that match your saved preferences. 
            The more you interact (like, save), the better your recommendations become!
          </p>
        </div>

        {/* Sign out */}
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </AppLayout>
  );
}
