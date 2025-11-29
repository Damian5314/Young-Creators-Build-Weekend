import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, Folder, Info, Copy, Share2, MessageCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/hooks';
import { Collection } from '@/lib/types';
import { toast } from 'sonner';

// ============ SaveToCollectionModal ============
interface SaveToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemType: 'RESTAURANT' | 'VIDEO' | 'RECIPE';
}

export function SaveToCollectionModal({ isOpen, onClose, itemId, itemType }: SaveToCollectionModalProps) {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [savedIn, setSavedIn] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) fetchCollections();
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
      const { data: items } = await supabase.from('collection_items').select('collection_id').eq('item_id', itemId);
      if (items) setSavedIn(items.map((i) => i.collection_id));
    }
    setLoading(false);
  };

  const createCollection = async () => {
    if (!user || !newName.trim()) return;
    setCreating(true);

    const { data, error } = await supabase
      .from('collections')
      .insert({ user_id: user.id, name: newName.trim(), type: itemType === 'RECIPE' ? 'RECIPE' : 'RESTAURANT' })
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
      await supabase.from('collection_items').delete().eq('collection_id', collectionId).eq('item_id', itemId);
      setSavedIn(savedIn.filter((id) => id !== collectionId));
    } else {
      await supabase.from('collection_items').insert({ collection_id: collectionId, item_type: itemType, item_id: itemId });
      setSavedIn([...savedIn, collectionId]);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg rounded-t-3xl bg-card p-6 pb-20 shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold">Save to Collection</h2>
              <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
            </div>

            <div className="flex gap-2 mb-6">
              <Input placeholder="New collection name..." value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-1" />
              <Button onClick={createCollection} disabled={!newName.trim() || creating}><Plus className="h-4 w-4 mr-1" />Create</Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : collections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No collections yet. Create one above!</div>
              ) : (
                collections.map((collection) => (
                  <button key={collection.id} onClick={() => toggleCollection(collection.id)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center"><Folder className="h-5 w-5 text-primary" /></div>
                    <span className="flex-1 text-left font-medium">{collection.name}</span>
                    {savedIn.includes(collection.id) && <Check className="h-5 w-5 text-primary" />}
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

// ============ ActionModal ============
interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'order' | 'reserve';
  restaurantName: string;
}

export function ActionModal({ isOpen, onClose, type, restaurantName }: ActionModalProps) {
  const isOrder = type === 'order';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-elevated text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Info className="h-8 w-8 text-primary" />
            </div>

            <h2 className="text-xl font-display font-bold mb-2">{isOrder ? 'Order Food' : 'Make Reservation'}</h2>

            <p className="text-muted-foreground mb-6">
              {isOrder
                ? `In production, this would connect to ${restaurantName}'s ordering system.`
                : `In production, this would open ${restaurantName}'s reservation system.`}
            </p>

            <div className="bg-secondary/50 rounded-xl p-4 mb-6">
              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Demo Note:</strong> This is a prototype feature.</p>
            </div>

            <Button onClick={onClose} className="w-full" size="lg">Got it!</Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============ ShareModal ============
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemType: 'RESTAURANT' | 'RECIPE';
  itemName: string;
}

export function ShareModal({ isOpen, onClose, itemId, itemType, itemName }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    if (itemType === 'RESTAURANT') {
      return `${baseUrl}/restaurant/${itemId}`;
    } else {
      return `${baseUrl}/recipe/${itemId}`;
    }
  };

  const shareUrl = getShareUrl();
  const shareText = itemType === 'RESTAURANT'
    ? `Check out ${itemName} on FlavorSwipe!`
    : `Try this recipe: ${itemName} on FlavorSwipe!`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link gekopieerd!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Kon link niet kopiëren');
    }
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(shareText);
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaNative = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: shareText,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg rounded-t-3xl bg-card p-6 pb-20 shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold">Delen</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-3">
              {/* Native Share (mobile) or Copy Link (desktop) */}
              <button
                onClick={shareViaNative}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {copied ? (
                    <Check className="h-6 w-6 text-primary" />
                  ) : (
                    <Share2 className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">
                    {'share' in navigator ? 'Deel via...' : 'Kopieer link'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {'share' in navigator ? 'Kies een app om te delen' : 'Deel deze link met anderen'}
                  </p>
                </div>
              </button>

              {/* Copy Link */}
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  {copied ? (
                    <Check className="h-6 w-6 text-blue-500" />
                  ) : (
                    <Copy className="h-6 w-6 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Kopieer link</p>
                  <p className="text-sm text-muted-foreground">
                    {copied ? 'Gekopieerd!' : 'Link naar klembord'}
                  </p>
                </div>
              </button>

              {/* WhatsApp */}
              <button
                onClick={shareViaWhatsApp}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-green-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-sm text-muted-foreground">Deel via WhatsApp</p>
                </div>
              </button>

              {/* Email */}
              <button
                onClick={shareViaEmail}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-red-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">Verstuur via email</p>
                </div>
              </button>
            </div>

            {/* Share URL Preview */}
            <div className="mt-6 p-3 bg-secondary/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Link:</p>
              <p className="text-sm font-mono truncate">{shareUrl}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
