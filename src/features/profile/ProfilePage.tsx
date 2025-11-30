import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, LogOut, ChevronRight, Store, Check, Loader2, Plus, X, Folder, Trash2, Play } from 'lucide-react';
import { AppLayout } from '@/shared/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/shared/hooks';
import { DIETARY_OPTIONS } from '@/shared/constants';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Collection } from '@/shared/types';

interface CollectionWithItems extends Collection {
  itemCount: number;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [newCuisineType, setNewCuisineType] = useState('');
  const [cuisineTypes, setCuisineTypes] = useState<string[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    city: profile?.city || '',
    dietary_preferences: profile?.dietary_preferences || [],
  });

  // Collections state
  const [collections, setCollections] = useState<CollectionWithItems[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionType, setNewCollectionType] = useState<'RESTAURANT' | 'RECIPE'>('RESTAURANT');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [collectionItems, setCollectionItems] = useState<any[]>([]);

  const isOwner = profile?.role === 'OWNER';

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        city: profile.city || '',
        dietary_preferences: profile.dietary_preferences || [],
      });
    }
  }, [profile]);

  // Fetch restaurant data for owners
  useEffect(() => {
    const fetchRestaurant = async () => {
      if (user && isOwner) {
        const { data } = await supabase
          .from('restaurants')
          .select('id, cuisine_types')
          .eq('owner_id', user.id)
          .single();

        if (data) {
          setRestaurantId(data.id);
          setCuisineTypes(data.cuisine_types || []);
        }
      }
    };

    fetchRestaurant();
  }, [user, isOwner]);

  // Fetch collections
  useEffect(() => {
    if (user) {
      fetchCollections();
    } else {
      setLoadingCollections(false);
    }
  }, [user]);

  const fetchCollections = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      const collectionsWithCounts = await Promise.all(
        data.map(async (col) => {
          const { count } = await supabase
            .from('collection_items')
            .select('*', { count: 'exact', head: true })
            .eq('collection_id', col.id);

          return { ...col, itemCount: count || 0 } as CollectionWithItems;
        })
      );

      setCollections(collectionsWithCounts);
    }
    setLoadingCollections(false);
  };

  const createCollection = async () => {
    if (!user || !newCollectionName.trim()) return;

    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        name: newCollectionName.trim(),
        type: newCollectionType,
      })
      .select()
      .single();

    if (!error && data) {
      setCollections([{ ...data, itemCount: 0 } as CollectionWithItems, ...collections]);
      setNewCollectionName('');
      setShowCreate(false);
      toast.success('Collectie aangemaakt!');
    }
  };

  const deleteCollection = async (id: string) => {
    await supabase.from('collections').delete().eq('id', id);
    setCollections(collections.filter((c) => c.id !== id));
    toast.success('Collectie verwijderd');
  };

  const openCollection = async (collection: Collection) => {
    setSelectedCollection(collection);

    const { data: items } = await supabase
      .from('collection_items')
      .select('*')
      .eq('collection_id', collection.id);

    if (items && items.length > 0) {
      const videoIds = items.filter((i) => i.item_type === 'VIDEO').map((i) => i.item_id);
      const recipeIds = items.filter((i) => i.item_type === 'RECIPE').map((i) => i.item_id);
      const restaurantIds = items.filter((i) => i.item_type === 'RESTAURANT').map((i) => i.item_id);

      const results: any[] = [];

      if (videoIds.length > 0) {
        const { data: videos } = await supabase
          .from('videos')
          .select('*, restaurant:restaurants(*)')
          .in('id', videoIds);
        if (videos) results.push(...videos.map((v) => ({ ...v, _type: 'VIDEO' })));
      }

      if (recipeIds.length > 0) {
        const { data: recipes } = await supabase.from('recipes').select('*').in('id', recipeIds);
        if (recipes) results.push(...recipes.map((r) => ({ ...r, _type: 'RECIPE' })));
      }

      if (restaurantIds.length > 0) {
        const { data: restaurants } = await supabase
          .from('restaurants')
          .select('*')
          .in('id', restaurantIds);
        if (restaurants) results.push(...restaurants.map((r) => ({ ...r, _type: 'RESTAURANT' })));
      }

      setCollectionItems(results);
    } else {
      setCollectionItems([]);
    }
  };

  const removeFromCollection = async (itemId: string) => {
    if (!selectedCollection) return;

    await supabase
      .from('collection_items')
      .delete()
      .eq('collection_id', selectedCollection.id)
      .eq('item_id', itemId);

    setCollectionItems(collectionItems.filter((i) => i.id !== itemId));
    toast.success('Verwijderd uit collectie');
  };

  const hasChanges =
    formData.name !== (profile?.name || '') ||
    formData.city !== (profile?.city || '') ||
    JSON.stringify(formData.dietary_preferences) !==
      JSON.stringify(profile?.dietary_preferences || []);

  if (!user) {
    return (
      <AppLayout>
        <div className="empty-state h-screen">
          <div className="empty-state-icon">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h1 className="empty-state-title">Log in om je profiel te zien</h1>
          <p className="empty-state-description">Beheer je voorkeuren en opgeslagen items</p>
          <Button onClick={() => navigate('/auth')} size="lg">
            Inloggen
          </Button>
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
      toast.error('Opslaan mislukt');
    } else {
      await refreshProfile();
      toast.success('Profiel bijgewerkt!');
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

  const addCuisineType = async () => {
    if (!newCuisineType.trim() || !restaurantId) return;

    const updatedTypes = [...cuisineTypes, newCuisineType.trim()];

    const { error } = await supabase
      .from('restaurants')
      .update({ cuisine_types: updatedTypes })
      .eq('id', restaurantId);

    if (error) {
      toast.error('Toevoegen mislukt');
    } else {
      setCuisineTypes(updatedTypes);
      setNewCuisineType('');
      toast.success('Toegevoegd!');
    }
  };

  const removeCuisineType = async (typeToRemove: string) => {
    if (!restaurantId) return;

    const updatedTypes = cuisineTypes.filter(t => t !== typeToRemove);

    const { error } = await supabase
      .from('restaurants')
      .update({ cuisine_types: updatedTypes })
      .eq('id', restaurantId);

    if (error) {
      toast.error('Verwijderen mislukt');
    } else {
      setCuisineTypes(updatedTypes);
      toast.success('Verwijderd!');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
    toast.success('Uitgelogd');
  };

  return (
    <AppLayout>
      <div className="fixed inset-0 bottom-14 overflow-y-auto overscroll-none px-4 pt-6 pb-6">
        <div className="page-header">
          <div className="flex items-center justify-between mb-8">
            <h1 className="page-title">Profiel</h1>
            {hasChanges && (
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Opslaan'}
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
                placeholder="Je naam"
                className="mb-2 h-12"
              />
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="card-elevated mb-4">
          <h3 className="section-title flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Locatie
          </h3>
          <Input
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Je stad"
            className="h-12"
          />
        </div>

        {isOwner ? (
          // Restaurant owner: show cuisine types / products
          <div className="card-elevated mb-4">
            <h3 className="section-title">Wat verkoop je?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Voeg keuken types of producten toe die je verkoopt
            </p>

            {/* Add new cuisine type */}
            <div className="flex gap-2 mb-4">
              <Input
                value={newCuisineType}
                onChange={(e) => setNewCuisineType(e.target.value)}
                placeholder="Bijv: Pizza, Sushi, Halal..."
                className="h-12 flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCuisineType();
                  }
                }}
              />
              <Button
                onClick={addCuisineType}
                disabled={!newCuisineType.trim()}
                className="h-12 px-4"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {/* Display cuisine types */}
            <div className="flex flex-wrap gap-2">
              {cuisineTypes.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Nog geen types toegevoegd
                </p>
              ) : (
                cuisineTypes.map((type) => (
                  <div
                    key={type}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground flex items-center gap-2"
                  >
                    {type}
                    <button
                      onClick={() => removeCuisineType(type)}
                      className="hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          // Regular user: show dietary preferences
          <div className="card-elevated mb-4">
            <h3 className="section-title">Dieetvoorkeuren</h3>
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
        )}

        {/* Collections section */}
        <div className="card-elevated mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2 mb-0">
              <Folder className="h-4 w-4 text-primary" />
              Mijn Collecties
            </h3>
            <Button onClick={() => setShowCreate(true)} size="sm" variant="ghost" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Nieuw
            </Button>
          </div>

          {loadingCollections ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : collections.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nog geen collecties. Maak er een aan om je favorieten op te slaan!
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => openCollection(collection)}
                  className="p-3 bg-secondary rounded-xl text-left hover:bg-secondary/80 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Folder className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm truncate">{collection.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {collection.itemCount} items
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {isOwner && (
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
              <p className="text-sm text-muted-foreground">Beheer je restaurant</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </motion.button>
        )}

        <Button variant="secondary" className="w-full h-12" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Uitloggen
        </Button>
      </div>

      {/* Create collection modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-background/80 backdrop-blur-md"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-elevated border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-display font-bold mb-6">Nieuwe Collectie</h2>

              <div className="space-y-4">
                <div>
                  <label className="section-title">Naam</label>
                  <Input
                    placeholder="Mijn favorieten..."
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="section-title">Type</label>
                  <div className="flex gap-2">
                    <Button
                      variant={newCollectionType === 'RESTAURANT' ? 'default' : 'secondary'}
                      onClick={() => setNewCollectionType('RESTAURANT')}
                      className="flex-1 h-12"
                    >
                      Restaurants
                    </Button>
                    <Button
                      variant={newCollectionType === 'RECIPE' ? 'default' : 'secondary'}
                      onClick={() => setNewCollectionType('RECIPE')}
                      className="flex-1 h-12"
                    >
                      Recepten
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  variant="secondary"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 h-12"
                >
                  Annuleren
                </Button>
                <Button onClick={createCollection} disabled={!newCollectionName.trim()} className="flex-1 h-12">
                  Aanmaken
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collection detail modal */}
      <AnimatePresence>
        {selectedCollection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedCollection(null)}>
                    <X className="h-5 w-5" />
                  </Button>
                  <h2 className="text-lg font-display font-bold">{selectedCollection.name}</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    deleteCollection(selectedCollection.id);
                    setSelectedCollection(null);
                  }}
                >
                  <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 pb-24">
                {collectionItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Deze collectie is leeg
                  </div>
                ) : (
                  <div className="space-y-3">
                    {collectionItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border"
                      >
                        <div className="h-16 w-16 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                          {item.thumbnail_url || item.image_url ? (
                            <img
                              src={item.thumbnail_url || item.image_url}
                              alt={item.title || item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              {item._type === 'VIDEO' ? (
                                <Play className="h-6 w-6 text-muted-foreground" />
                              ) : (
                                <Folder className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{item.title || item.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {item._type === 'VIDEO' ? 'Video' : item._type === 'RECIPE' ? 'Recept' : 'Restaurant'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {item._type === 'VIDEO' && item.restaurant && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/restaurant/${item.restaurant.id}`)}
                            >
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCollection(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
