import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, MapPin, LogOut, ChevronRight, Store, Check, Loader2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/hooks';
import { DIETARY_OPTIONS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    city: profile?.city || '',
    dietary_preferences: profile?.dietary_preferences || [],
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        city: profile.city || '',
        dietary_preferences: profile.dietary_preferences || [],
      });
    }
  }, [profile]);

  const hasChanges =
    formData.name !== (profile?.name || '') ||
    formData.city !== (profile?.city || '') ||
    JSON.stringify(formData.dietary_preferences) !==
      JSON.stringify(profile?.dietary_preferences || []);

  if (!user) {
    return (
      <Layout>
        <div className="empty-state h-screen">
          <div className="empty-state-icon">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h1 className="empty-state-title">Sign in to view profile</h1>
          <p className="empty-state-description">Manage your preferences and saved items</p>
          <Button onClick={() => navigate('/auth')} size="lg">
            Sign In
          </Button>
        </div>
      </Layout>
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
    }

    setSaving(false);
  };

  const togglePreference = (pref: string) => {
    setFormData((prev) => ({
      ...prev,
      dietary_preferences: prev.dietary_preferences.includes(pref)
        ? prev.dietary_preferences.filter((p) => p !== pref)
        : [...prev.dietary_preferences, pref],
    }));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
    toast.success('Signed out successfully');
  };

  return (
    <Layout>
      <div className="fixed inset-0 bottom-14 overflow-y-auto overscroll-none px-4 pt-6 pb-6">
        <div className="page-header">
          <div className="flex items-center justify-between mb-8">
            <h1 className="page-title">Profile</h1>
            {hasChanges && (
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-20 w-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-primary-foreground">
                {(formData.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                className="mb-2 h-12"
              />
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="card-elevated mb-4">
          <h3 className="section-title flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Location
          </h3>
          <Input
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Your city"
            className="h-12"
          />
        </div>

        <div className="card-elevated mb-4">
          <h3 className="section-title">Dietary Preferences</h3>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((option) => {
              const isSelected = formData.dietary_preferences.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => togglePreference(option.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  <span>{option.emoji}</span>
                  {option.label}
                  {isSelected && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </div>

        {profile?.role === 'OWNER' && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/dashboard/restaurant')}
            className="w-full card-elevated mb-4 flex items-center gap-4"
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

        <div className="card-elevated mb-6 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-2 text-primary">How Recommendations Work</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            FoodSwipe uses your location and dietary preferences to show you relevant restaurants. We
            prioritize trending content and restaurants that match your saved preferences. The more
            you interact (like, save), the better your recommendations become!
          </p>
        </div>

        <Button variant="secondary" className="w-full h-12" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </Layout>
  );
}
