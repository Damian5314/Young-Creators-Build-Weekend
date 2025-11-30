import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, Folder, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/shared/hooks';
import { Collection } from '@/shared/types';
import { toast } from 'sonner';

interface SaveToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemType: 'RESTAURANT' | 'VIDEO' | 'RECIPE';
}

export function SaveToCollectionModal({
  isOpen,
  onClose,
  itemId,
  itemType,
}: SaveToCollectionModalProps) {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [savedIn, setSavedIn] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      // Reset state when modal opens with new item
      setSavedIn([]);
      fetchCollections();
    }
  }, [isOpen, user, itemId]);

  // Reset collections when modal closes
  useEffect(() => {
    if (!isOpen) {
      setNewName('');
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    if (!user) {
      console.log('No user found, skipping fetch');
      return;
    }

    setLoading(true);

    try {
      // Fetch ALL collections for the user (not filtered by type)
      const { data: cols, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Fetched collections:', cols, 'Error:', error);

      if (error) {
        console.error('Error fetching collections:', error);
        toast.error('Could not load collections');
        setLoading(false);
        return;
      }

      setCollections((cols || []) as Collection[]);

      // Check which collections already have this item
      if (itemId) {
        const { data: items, error: itemsError } = await supabase
          .from('collection_items')
          .select('collection_id')
          .eq('item_id', itemId);

        console.log('Fetched collection items for', itemId, ':', items, 'Error:', itemsError);

        if (items && !itemsError) {
          setSavedIn(items.map((i) => i.collection_id));
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async () => {
    if (!user || !newName.trim()) return;

    setCreating(true);
    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        name: newName.trim(),
        type: itemType === 'RECIPE' ? 'RECIPE' : 'RESTAURANT',
      })
      .select()
      .single();

    if (error) {
      toast.error('Could not create collection');
      setCreating(false);
      return;
    }

    if (data) {
      const newCollection = data as Collection;
      setCollections([newCollection, ...collections]);
      setNewName('');
      toast.success(`Collection "${newCollection.name}" created!`);

      // Automatically add item to the new collection
      if (itemId) {
        await toggleCollection(newCollection.id);
      }
    }
    setCreating(false);
  };

  const toggleCollection = async (collectionId: string) => {
    if (!user || !itemId) return;

    const isInCollection = savedIn.includes(collectionId);
    const collection = collections.find(c => c.id === collectionId);

    if (isInCollection) {
      const { error } = await supabase
        .from('collection_items')
        .delete()
        .eq('collection_id', collectionId)
        .eq('item_id', itemId);

      if (error) {
        toast.error('Could not remove from collection');
        return;
      }

      setSavedIn(savedIn.filter((id) => id !== collectionId));
      toast.success(`Removed from "${collection?.name}"`);
    } else {
      const { error } = await supabase.from('collection_items').insert({
        collection_id: collectionId,
        item_type: itemType,
        item_id: itemId,
      });

      if (error) {
        toast.error('Could not add to collection');
        return;
      }

      setSavedIn([...savedIn, collectionId]);
      toast.success(`Added to "${collection?.name}"`);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm touch-none"
          onClick={onClose}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full max-w-lg rounded-t-3xl bg-card p-6 pb-20 shadow-elevated touch-auto"
            onClick={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold">Save to Collection</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Create new collection */}
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="New collection name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createCollection()}
                className="flex-1"
              />
              <Button onClick={createCollection} disabled={!newName.trim() || creating}>
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Create
                  </>
                )}
              </Button>
            </div>

            {/* Collections list */}
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading collections...</span>
                </div>
              ) : collections.length === 0 ? (
                <div className="text-center py-8">
                  <Folder className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground font-medium">No collections yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Create your first collection above!</p>
                </div>
              ) : (
                collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => toggleCollection(collection.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      savedIn.includes(collection.id)
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-secondary/50'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      savedIn.includes(collection.id) ? 'bg-primary/20' : 'bg-secondary'
                    }`}>
                      <Folder className={`h-5 w-5 ${
                        savedIn.includes(collection.id) ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-medium">{collection.name}</span>
                      <p className="text-xs text-muted-foreground capitalize">{collection.type?.toLowerCase() || 'General'}</p>
                    </div>
                    {savedIn.includes(collection.id) && (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Hint */}
            {collections.length > 0 && (
              <p className="text-xs text-center text-muted-foreground mt-4">
                Tap a collection to add or remove this item
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
