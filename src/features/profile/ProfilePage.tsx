import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, LogOut, ChevronRight, Store, Check, Loader2, Plus, X, Folder, Trash2, Play, UtensilsCrossed, FolderOpen, Video } from 'lucide-react';
import { AppLayout } from '@/shared/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/shared/hooks';
import { DIETARY_OPTIONS } from '@/shared/constants';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Collection, Recipe } from '@/shared/types';

type CollectionTabType = 'recipes' | 'restaurants';

interface UserVideo extends Recipe {
  // Recipe already has video_url, we just filter for ones that have it
}

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
  const [newCollectionType, setNewCollectionType] = useState<'RESTAURANT' | 'RECIPE'>('RECIPE');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [collectionItems, setCollectionItems] = useState<any[]>([]);
  const [collectionTab, setCollectionTab] = useState<CollectionTabType>('recipes');
  const [editMode, setEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // My Videos state
  const [myVideos, setMyVideos] = useState<UserVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [videoEditMode, setVideoEditMode] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());

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

  // Fetch my videos (depends on restaurantId for owners)
  useEffect(() => {
    if (user) {
      // For owners, wait until restaurantId is loaded
      if (isOwner && !restaurantId) {
        return;
      }
      fetchMyVideos();
    } else {
      setLoadingVideos(false);
    }
  }, [user, isOwner, restaurantId]);

  const fetchMyVideos = async () => {
    if (!user) return;

    if (isOwner && restaurantId) {
      // For restaurant owners: fetch from videos table
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Map videos to match the UserVideo interface
        const mappedVideos = data.map((v) => ({
          id: v.id,
          title: v.title,
          description: v.description,
          video_url: v.video_url,
          image_url: v.thumbnail_url,
          like_count: v.like_count || 0,
          view_count: v.view_count || 0,
          source: 'USER' as const,
          created_at: v.created_at,
        }));
        setMyVideos(mappedVideos as UserVideo[]);
      }
    } else {
      // For regular users: fetch from recipes table
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .not('video_url', 'is', null)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMyVideos(data as UserVideo[]);
      }
    }
    setLoadingVideos(false);
  };

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
    setEditMode(false);
    setSelectedItems(new Set());

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

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const deleteSelectedItems = async () => {
    if (!selectedCollection || selectedItems.size === 0) return;

    for (const itemId of selectedItems) {
      await supabase
        .from('collection_items')
        .delete()
        .eq('collection_id', selectedCollection.id)
        .eq('item_id', itemId);
    }

    setCollectionItems(collectionItems.filter((i) => !selectedItems.has(i.id)));
    setSelectedItems(new Set());
    setEditMode(false);
    toast.success(`${selectedItems.size} items verwijderd`);
  };

  // Video selection and deletion
  const toggleVideoSelection = (videoId: string) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId);
    } else {
      newSelected.add(videoId);
    }
    setSelectedVideos(newSelected);
  };

  const deleteSelectedVideos = async () => {
    if (selectedVideos.size === 0) return;

    const table = isOwner ? 'videos' : 'recipes';

    for (const videoId of selectedVideos) {
      await supabase.from(table).delete().eq('id', videoId);
    }

    setMyVideos(myVideos.filter((v) => !selectedVideos.has(v.id)));
    setSelectedVideos(new Set());
    setVideoEditMode(false);
    toast.success(`${selectedVideos.size} video('s) verwijderd`);
  };

  // Filter collections by tab
  const recipeCollections = collections.filter((c) => c.type === 'RECIPE');
  const restaurantCollections = collections.filter((c) => c.type === 'RESTAURANT');
  const filteredCollections = collectionTab === 'recipes' ? recipeCollections : restaurantCollections;

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
                      type="button"
                      aria-label={`Remove ${type} cuisine type`}
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

        {/* Collections section - Premium Dark UI */}
        <div className="rounded-2xl bg-zinc-900/50 border border-white/5 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Folder className="h-4 w-4" style={{ color: '#fd6159' }} />
              Mijn Collecties
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreate(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: '#fd6159', boxShadow: '0 4px 14px rgba(253, 97, 89, 0.3)' }}
            >
              <Plus className="h-4 w-4 text-white" />
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-4">
            <button
              onClick={() => setCollectionTab('recipes')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                collectionTab === 'recipes'
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <UtensilsCrossed className="h-3.5 w-3.5" />
              Recepten
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">
                {recipeCollections.length}
              </span>
            </button>
            <button
              onClick={() => setCollectionTab('restaurants')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                collectionTab === 'restaurants'
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              Restaurants
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">
                {restaurantCollections.length}
              </span>
            </button>
          </div>

          {loadingCollections ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#fd6159' }} />
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="flex flex-col items-center py-6">
              <div className="w-12 h-12 mb-3 rounded-xl bg-zinc-800/50 border border-white/5 flex items-center justify-center">
                {collectionTab === 'recipes' ? (
                  <UtensilsCrossed className="h-6 w-6 text-zinc-600" />
                ) : (
                  <MapPin className="h-6 w-6 text-zinc-600" />
                )}
              </div>
              <p className="text-sm text-zinc-500 text-center">
                Nog geen {collectionTab === 'recipes' ? 'recept' : 'restaurant'} collecties
              </p>
              <button
                onClick={() => {
                  setNewCollectionType(collectionTab === 'recipes' ? 'RECIPE' : 'RESTAURANT');
                  setShowCreate(true);
                }}
                className="mt-2 text-xs hover:opacity-80"
                style={{ color: '#fd6159' }}
              >
                Maak er een aan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filteredCollections.map((collection, index) => (
                <motion.button
                  key={collection.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openCollection(collection)}
                  className="group relative p-3 rounded-xl bg-zinc-800/50 border border-white/5 text-left transition-all duration-200 hover:border-white/10 hover:bg-zinc-800/70"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(253, 97, 89, 0.2)' }}>
                      {collection.type === 'RECIPE' ? (
                        <UtensilsCrossed className="h-3.5 w-3.5" style={{ color: '#fd6159' }} />
                      ) : (
                        <MapPin className="h-3.5 w-3.5" style={{ color: '#fd6159' }} />
                      )}
                    </div>
                    <span className="font-medium text-sm text-white truncate flex-1">{collection.name}</span>
                  </div>
                  <p className="text-xs text-zinc-500 ml-9">
                    {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
                  </p>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* My Videos section - Premium Dark UI */}
        <div className="rounded-2xl bg-zinc-900/50 border border-white/5 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Video className="h-4 w-4" style={{ color: '#fd6159' }} />
              Mijn Video's
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full text-zinc-400">
                {myVideos.length}
              </span>
            </h3>
            <div className="flex items-center gap-2">
              {myVideos.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setVideoEditMode(!videoEditMode);
                    setSelectedVideos(new Set());
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    videoEditMode
                      ? 'border border-[#fd6159]/30'
                      : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'
                  }`}
                  style={videoEditMode ? { backgroundColor: 'rgba(253, 97, 89, 0.2)', color: '#fd6159' } : {}}
                >
                  {videoEditMode ? 'Klaar' : 'Bewerken'}
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/upload')}
                className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: '#fd6159', boxShadow: '0 4px 14px rgba(253, 97, 89, 0.3)' }}
              >
                <Plus className="h-4 w-4 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Delete action bar */}
          <AnimatePresence>
            {videoEditMode && selectedVideos.size > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">
                    {selectedVideos.size} geselecteerd
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={deleteSelectedVideos}
                    className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Verwijderen
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loadingVideos ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#fd6159' }} />
            </div>
          ) : myVideos.length === 0 ? (
            <div className="flex flex-col items-center py-6">
              <div className="w-12 h-12 mb-3 rounded-xl bg-zinc-800/50 border border-white/5 flex items-center justify-center">
                <Video className="h-6 w-6 text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-500 text-center">
                Je hebt nog geen video's geüpload
              </p>
              <button
                onClick={() => navigate('/upload')}
                className="mt-2 text-xs hover:opacity-80"
                style={{ color: '#fd6159' }}
              >
                Upload je eerste video
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {myVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => videoEditMode && toggleVideoSelection(video.id)}
                  className={`relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer transition-all ${
                    videoEditMode && selectedVideos.has(video.id)
                      ? 'ring-2 ring-[#fd6159]'
                      : 'hover:opacity-90'
                  }`}
                >
                  {/* Thumbnail or video preview */}
                  {video.image_url ? (
                    <img
                      src={video.image_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={video.video_url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Play icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="h-4 w-4 text-white ml-0.5" fill="white" />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-[10px] text-white font-medium line-clamp-2">
                      {video.title}
                    </p>
                  </div>

                  {/* Selection checkbox */}
                  {videoEditMode && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedVideos.has(video.id)
                          ? ''
                          : 'border-white/50 bg-black/30'
                      }`}
                      style={selectedVideos.has(video.id) ? { backgroundColor: '#fd6159', borderColor: '#fd6159' } : {}}
                    >
                      {selectedVideos.has(video.id) && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </motion.div>
                  )}
                </motion.div>
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

      {/* Create collection modal - Premium Dark UI */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-w-lg rounded-t-3xl bg-zinc-900 border-t border-white/10 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle bar */}
              <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-6" />

              <h2 className="text-xl font-bold text-white mb-6">Nieuwe Collectie</h2>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-zinc-400 mb-2 block">Naam</label>
                  <Input
                    placeholder="Mijn favorieten..."
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 rounded-xl focus:border-[#fd6159]/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-400 mb-2 block">Type</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setNewCollectionType('RECIPE')}
                      className={`flex-1 h-14 rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                        newCollectionType === 'RECIPE'
                          ? 'border-[#fd6159]/50'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20'
                      }`}
                      style={newCollectionType === 'RECIPE' ? { backgroundColor: 'rgba(253, 97, 89, 0.1)', color: '#fd6159' } : {}}
                    >
                      <UtensilsCrossed className="h-5 w-5" />
                      Recepten
                    </button>
                    <button
                      onClick={() => setNewCollectionType('RESTAURANT')}
                      className={`flex-1 h-14 rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                        newCollectionType === 'RESTAURANT'
                          ? 'border-[#fd6159]/50'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20'
                      }`}
                      style={newCollectionType === 'RESTAURANT' ? { backgroundColor: 'rgba(253, 97, 89, 0.1)', color: '#fd6159' } : {}}
                    >
                      <MapPin className="h-5 w-5" />
                      Restaurants
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  variant="ghost"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 h-12 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5"
                >
                  Annuleren
                </Button>
                <Button
                  onClick={createCollection}
                  disabled={!newCollectionName.trim()}
                  className="flex-1 h-12 rounded-xl text-white disabled:opacity-50 hover:opacity-90"
                  style={{ backgroundColor: '#fd6159' }}
                >
                  Aanmaken
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collection detail modal - Premium Dark UI */}
      <AnimatePresence>
        {selectedCollection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedCollection(null);
                      setEditMode(false);
                      setSelectedItems(new Set());
                    }}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedCollection.name}</h2>
                    <p className="text-xs text-zinc-500">{collectionItems.length} items</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {collectionItems.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditMode(!editMode);
                        setSelectedItems(new Set());
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        editMode
                          ? 'border border-[#fd6159]/30'
                          : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'
                      }`}
                      style={editMode ? { backgroundColor: 'rgba(253, 97, 89, 0.2)', color: '#fd6159' } : {}}
                    >
                      {editMode ? 'Klaar' : 'Bewerken'}
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      deleteCollection(selectedCollection.id);
                      setSelectedCollection(null);
                    }}
                    className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>

              {/* Edit mode action bar */}
              <AnimatePresence>
                {editMode && selectedItems.size > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-zinc-900 border-b border-white/5 px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">
                        {selectedItems.size} geselecteerd
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={deleteSelectedItems}
                        className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Verwijderen
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 pb-24">
                {collectionItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 mb-4 rounded-2xl bg-zinc-800/50 border border-white/5 flex items-center justify-center">
                      <FolderOpen className="h-8 w-8 text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 text-center">Deze collectie is leeg</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      Voeg items toe vanuit de feed
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {collectionItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          editMode && selectedItems.has(item.id)
                            ? 'border-[#fd6159]/30'
                            : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
                        }`}
                        style={editMode && selectedItems.has(item.id) ? { backgroundColor: 'rgba(253, 97, 89, 0.1)' } : {}}
                        onClick={() => editMode && toggleItemSelection(item.id)}
                      >
                        {/* Edit mode checkbox */}
                        {editMode && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                              selectedItems.has(item.id)
                                ? ''
                                : 'border-zinc-600'
                            }`}
                            style={selectedItems.has(item.id) ? { backgroundColor: '#fd6159', borderColor: '#fd6159' } : {}}
                          >
                            {selectedItems.has(item.id) && (
                              <Check className="h-4 w-4 text-white" />
                            )}
                          </motion.div>
                        )}

                        {/* Thumbnail */}
                        <div className="h-14 w-14 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                          {item.thumbnail_url || item.image_url ? (
                            <img
                              src={item.thumbnail_url || item.image_url}
                              alt={item.title || item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              {item._type === 'VIDEO' ? (
                                <Play className="h-5 w-5 text-zinc-600" />
                              ) : item._type === 'RECIPE' ? (
                                <UtensilsCrossed className="h-5 w-5 text-zinc-600" />
                              ) : (
                                <MapPin className="h-5 w-5 text-zinc-600" />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white text-sm truncate">
                            {item.title || item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full ${
                                item._type === 'VIDEO'
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : item._type === 'RESTAURANT'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : ''
                              }`}
                              style={item._type === 'RECIPE' ? { backgroundColor: 'rgba(253, 97, 89, 0.2)', color: '#fd6159' } : {}}
                            >
                              {item._type === 'VIDEO' ? 'Video' : item._type === 'RECIPE' ? 'Recept' : 'Restaurant'}
                            </span>
                          </div>
                        </div>

                        {/* Actions (only when not in edit mode) */}
                        {!editMode && (
                          <div className="flex items-center gap-1">
                            {item._type === 'VIDEO' && item.restaurant && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/restaurant/${item.restaurant.id}`);
                                }}
                                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromCollection(item.id);
                              }}
                              className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>
                        )}
                      </motion.div>
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
