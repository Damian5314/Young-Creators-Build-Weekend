import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Plus, Trash2, X, ChevronRight, Play } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/hooks';
import { Collection } from '@/lib/types';
import { toast } from 'sonner';

interface CollectionWithItems extends Collection {
  itemCount: number;
}

export default function CollectionsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [collections, setCollections] = useState<CollectionWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'RESTAURANT' | 'RECIPE'>('RESTAURANT');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [collectionItems, setCollectionItems] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchCollections();
    } else {
      setLoading(false);
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
    setLoading(false);
  };

  const createCollection = async () => {
    if (!user || !newName.trim()) return;

    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        name: newName.trim(),
        type: newType,
      })
      .select()
      .single();

    if (!error && data) {
      setCollections([{ ...data, itemCount: 0 } as CollectionWithItems, ...collections]);
      setNewName('');
      setShowCreate(false);
      toast.success('Collection created!');
    }
  };

  const deleteCollection = async (id: string) => {
    await supabase.from('collections').delete().eq('id', id);
    setCollections(collections.filter((c) => c.id !== id));
    toast.success('Collection deleted');
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
    toast.success('Removed from collection');
  };

  if (!user) {
    return (
      <Layout>
        <div className="empty-state h-screen">
          <div className="empty-state-icon">
            <Folder className="h-10 w-10 text-primary" />
          </div>
          <h1 className="empty-state-title">Sign in to view collections</h1>
          <p className="empty-state-description">Save your favorite restaurants, videos, and recipes</p>
          <Button onClick={() => navigate('/auth')} size="lg">
            Sign In
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header flex items-center justify-between">
          <h1 className="page-title">My Collections</h1>
          <Button onClick={() => setShowCreate(true)} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : collections.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Folder className="h-10 w-10 text-primary" />
            </div>
            <h2 className="empty-state-title">No collections yet</h2>
            <p className="empty-state-description">
              Start organizing your favorite restaurants and recipes
            </p>
            <Button onClick={() => setShowCreate(true)} size="lg">
              Create your first collection
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {collections.map((collection) => (
              <motion.button
                key={collection.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openCollection(collection)}
                className="card-elevated text-left hover:border-primary/50 transition-all duration-200"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Folder className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold truncate mb-1">{collection.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'} •{' '}
                  {collection.type.toLowerCase()}
                </p>
              </motion.button>
            ))}
          </div>
        )}

        {/* Create modal */}
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
                <h2 className="text-xl font-display font-bold mb-6">New Collection</h2>

                <div className="space-y-4">
                  <div>
                    <label className="section-title">Name</label>
                    <Input
                      placeholder="My favorites..."
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="section-title">Type</label>
                    <div className="flex gap-2">
                      <Button
                        variant={newType === 'RESTAURANT' ? 'default' : 'secondary'}
                        onClick={() => setNewType('RESTAURANT')}
                        className="flex-1 h-12"
                      >
                        Restaurants
                      </Button>
                      <Button
                        variant={newType === 'RECIPE' ? 'default' : 'secondary'}
                        onClick={() => setNewType('RECIPE')}
                        className="flex-1 h-12"
                      >
                        Recipes
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
                    Cancel
                  </Button>
                  <Button onClick={createCollection} disabled={!newName.trim()} className="flex-1 h-12">
                    Create
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
                      This collection is empty
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
                              {item._type.toLowerCase()}
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
      </div>
    </Layout>
  );
}
