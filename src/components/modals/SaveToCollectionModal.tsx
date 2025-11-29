import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Collection } from '@/lib/types';
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
  itemType 
}: SaveToCollectionModalProps) {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [savedIn, setSavedIn] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchCollections();
    }
  }, [isOpen, user]);

  const fetchCollections = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data: cols } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', itemType === 'RECIPE' ? 'RECIPE' : 'RESTAURANT');

    if (cols) {
      setCollections(cols as Collection[]);
      
      // Check which collections already have this item
      const { data: items } = await supabase
        .from('collection_items')
        .select('collection_id')
        .eq('item_id', itemId);
      
      if (items) {
        setSavedIn(items.map(i => i.collection_id));
      }
    }
    setLoading(false);
  };

  const createCollection = async () => {
    if (!user || !newName.trim()) return;
    
    setCreating(true);
    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        name: newName.trim(),
        type: itemType === 'RECIPE' ? 'RECIPE' : 'RESTAURANT'
      })
      .select()
      .single();

    if (!error && data) {
      setCollections([...collections, data as Collection]);
      setNewName('');
    }
    setCreating(false);
  };

  const toggleCollection = async (collectionId: string) => {
    if (!user) return;

    const isInCollection = savedIn.includes(collectionId);

    if (isInCollection) {
      await supabase
        .from('collection_items')
        .delete()
        .eq('collection_id', collectionId)
        .eq('item_id', itemId);

      setSavedIn(savedIn.filter(id => id !== collectionId));
    } else {
      await supabase
        .from('collection_items')
        .insert({
          collection_id: collectionId,
          item_type: itemType,
          item_id: itemId
        });

      setSavedIn([...savedIn, collectionId]);
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
                className="flex-1"
              />
              <Button 
                onClick={createCollection} 
                disabled={!newName.trim() || creating}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
            </div>

            {/* Collections list */}
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading...
                </div>
              ) : collections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No collections yet. Create one above!
                </div>
              ) : (
                collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => toggleCollection(collection.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Folder className="h-5 w-5 text-primary" />
                    </div>
                    <span className="flex-1 text-left font-medium">
                      {collection.name}
                    </span>
                    {savedIn.includes(collection.id) && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
