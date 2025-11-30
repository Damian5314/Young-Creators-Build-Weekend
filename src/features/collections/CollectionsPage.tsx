import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder,
  Plus,
  Trash2,
  X,
  ChevronRight,
  Play,
  UtensilsCrossed,
  MapPin,
  MoreHorizontal,
  Pencil,
  Copy,
  GripVertical,
  Check,
  FolderOpen,
} from 'lucide-react';
import { AppLayout } from '@/shared/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/shared/hooks';
import { Collection } from '@/shared/types';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CollectionWithItems extends Collection {
  itemCount: number;
}

type TabType = 'recipes' | 'restaurants';

export default function CollectionsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [collections, setCollections] = useState<CollectionWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'RESTAURANT' | 'RECIPE'>('RECIPE');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [collectionItems, setCollectionItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('recipes');
  const [editMode, setEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [renameCollection, setRenameCollection] = useState<Collection | null>(null);
  const [renameValue, setRenameValue] = useState('');

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

  const deleteCollection = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await supabase.from('collections').delete().eq('id', id);
    setCollections(collections.filter((c) => c.id !== id));
    toast.success('Collection deleted');
  };

  const duplicateCollection = async (collection: CollectionWithItems, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user) return;

    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        name: `${collection.name} (copy)`,
        type: collection.type,
      })
      .select()
      .single();

    if (!error && data) {
      setCollections([{ ...data, itemCount: 0 } as CollectionWithItems, ...collections]);
      toast.success('Collection duplicated!');
    }
  };

  const handleRename = async () => {
    if (!renameCollection || !renameValue.trim()) return;

    await supabase
      .from('collections')
      .update({ name: renameValue.trim() })
      .eq('id', renameCollection.id);

    setCollections(
      collections.map((c) =>
        c.id === renameCollection.id ? { ...c, name: renameValue.trim() } : c
      )
    );
    setRenameCollection(null);
    setRenameValue('');
    toast.success('Collection renamed!');
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
    toast.success('Removed from collection');
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
    toast.success(`${selectedItems.size} items removed`);
  };

  // Filter collections by tab
  const recipeCollections = collections.filter((c) => c.type === 'RECIPE');
  const restaurantCollections = collections.filter((c) => c.type === 'RESTAURANT');
  const filteredCollections = activeTab === 'recipes' ? recipeCollections : restaurantCollections;

  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, rgba(253, 97, 89, 0.2), rgba(253, 97, 89, 0.1))' }}>
              <Folder className="h-10 w-10" style={{ color: '#fd6159' }} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Sign in to view collections</h1>
            <p className="text-zinc-500 mb-8">Save your favorite restaurants, videos, and recipes</p>
            <Button
              onClick={() => navigate('/auth')}
              className="text-white px-8 h-12 rounded-xl hover:opacity-90"
              style={{ backgroundColor: '#fd6159' }}
            >
              Sign In
            </Button>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#0a0a0a] pb-24">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">Collections</h1>

              {/* Floating Add Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreate(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: '#fd6159', boxShadow: '0 10px 25px rgba(253, 97, 89, 0.25)' }}
              >
                <Plus className="h-5 w-5 text-white" />
              </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
              <button
                onClick={() => setActiveTab('recipes')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'recipes'
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <UtensilsCrossed className="h-4 w-4" />
                Recipes
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                  {recipeCollections.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('restaurants')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'restaurants'
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <MapPin className="h-4 w-4" />
                Restaurants
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                  {restaurantCollections.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#fd6159', borderTopColor: 'transparent' }} />
            </div>
          ) : filteredCollections.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/5 flex items-center justify-center">
                {activeTab === 'recipes' ? (
                  <UtensilsCrossed className="h-12 w-12 text-zinc-600" />
                ) : (
                  <MapPin className="h-12 w-12 text-zinc-600" />
                )}
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No collections yet</h2>
              <p className="text-zinc-500 text-center mb-6 max-w-xs">
                Create your first {activeTab === 'recipes' ? 'recipe' : 'restaurant'} collection to organize your favorites.
              </p>
              <Button
                onClick={() => {
                  setNewType(activeTab === 'recipes' ? 'RECIPE' : 'RESTAURANT');
                  setShowCreate(true);
                }}
                className="text-white px-6 h-11 rounded-xl hover:opacity-90"
                style={{ backgroundColor: '#fd6159' }}
              >
                Create Collection
              </Button>
            </motion.div>
          ) : (
            /* Collections Grid */
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {filteredCollections.map((collection, index) => (
                  <motion.div
                    key={collection.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openCollection(collection)}
                    className="group relative p-4 rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/5 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:border-white/10 hover:shadow-xl hover:shadow-black/20"
                  >
                    {/* Glass overlay */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

                    {/* Icon */}
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(to bottom right, rgba(253, 97, 89, 0.2), rgba(253, 97, 89, 0.1))' }}>
                      {collection.type === 'RECIPE' ? (
                        <UtensilsCrossed className="h-5 w-5" style={{ color: '#fd6159' }} />
                      ) : (
                        <MapPin className="h-5 w-5" style={{ color: '#fd6159' }} />
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="font-semibold text-white truncate mb-1">{collection.name}</h3>
                    <p className="text-xs text-zinc-500">
                      {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
                    </p>

                    {/* Three-dots menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label="Collection options"
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                        >
                          <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 bg-zinc-900 border-white/10 rounded-xl p-1"
                      >
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenameCollection(collection);
                            setRenameValue(collection.name);
                          }}
                          className="rounded-lg text-zinc-300 focus:bg-white/5 focus:text-white"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => duplicateCollection(collection, e)}
                          className="rounded-lg text-zinc-300 focus:bg-white/5 focus:text-white"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openCollection(collection)}
                          className="rounded-lg text-zinc-300 focus:bg-white/5 focus:text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add items
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="rounded-lg text-zinc-300 focus:bg-white/5 focus:text-white"
                        >
                          <GripVertical className="h-4 w-4 mr-2" />
                          Reorder items
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem
                          onClick={(e) => deleteCollection(collection.id, e)}
                          className="rounded-lg text-red-400 focus:bg-red-500/10 focus:text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Create Modal */}
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

                <h2 className="text-xl font-bold text-white mb-6">New Collection</h2>

                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-zinc-400 mb-2 block">Name</label>
                    <Input
                      placeholder="My favorites..."
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 rounded-xl focus:border-[#fd6159]/50 focus:ring-[#fd6159]/20"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-400 mb-2 block">Type</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setNewType('RECIPE')}
                        className={`flex-1 h-14 rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                          newType === 'RECIPE'
                            ? 'border-[#fd6159]/50'
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20'
                        }`}
                        style={newType === 'RECIPE' ? { backgroundColor: 'rgba(253, 97, 89, 0.1)', color: '#fd6159' } : {}}
                      >
                        <UtensilsCrossed className="h-5 w-5" />
                        Recipes
                      </button>
                      <button
                        onClick={() => setNewType('RESTAURANT')}
                        className={`flex-1 h-14 rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                          newType === 'RESTAURANT'
                            ? 'border-[#fd6159]/50'
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20'
                        }`}
                        style={newType === 'RESTAURANT' ? { backgroundColor: 'rgba(253, 97, 89, 0.1)', color: '#fd6159' } : {}}
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
                    Cancel
                  </Button>
                  <Button
                    onClick={createCollection}
                    disabled={!newName.trim()}
                    className="flex-1 h-12 rounded-xl text-white disabled:opacity-50 hover:opacity-90"
                    style={{ backgroundColor: '#fd6159' }}
                  >
                    Create
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rename Modal */}
        <AnimatePresence>
          {renameCollection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setRenameCollection(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-white/10 p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-lg font-bold text-white mb-4">Rename Collection</h2>
                <Input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="h-12 bg-white/5 border-white/10 text-white rounded-xl mb-4"
                  autoFocus
                />
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setRenameCollection(null)}
                    className="flex-1 h-11 rounded-xl text-zinc-400"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRename}
                    className="flex-1 h-11 rounded-xl text-white hover:opacity-90"
                    style={{ backgroundColor: '#fd6159' }}
                  >
                    Save
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collection Detail Modal */}
        <AnimatePresence>
          {selectedCollection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#0a0a0a]"
            >
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Close collection"
                      onClick={() => {
                        setSelectedCollection(null);
                        setEditMode(false);
                        setSelectedItems(new Set());
                      }}
                      className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                    <div>
                      <h2 className="text-lg font-bold text-white">{selectedCollection.name}</h2>
                      <p className="text-xs text-zinc-500">{collectionItems.length} items</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditMode(!editMode);
                      setSelectedItems(new Set());
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      editMode
                        ? 'text-white'
                        : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                    }`}
                    style={editMode ? { backgroundColor: '#fd6159' } : {}}
                  >
                    {editMode ? 'Done' : 'Edit'}
                  </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 pb-32">
                  {collectionItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="w-20 h-20 mb-4 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
                        <FolderOpen className="h-10 w-10 text-zinc-700" />
                      </div>
                      <p className="text-zinc-500">This collection is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {collectionItems.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/50 border transition-all duration-200 ${
                            selectedItems.has(item.id)
                              ? 'border-[#fd6159]/50'
                              : 'border-white/5 hover:border-white/10'
                          }`}
                          style={selectedItems.has(item.id) ? { backgroundColor: 'rgba(253, 97, 89, 0.05)' } : {}}
                          onClick={() => editMode && toggleItemSelection(item.id)}
                        >
                          {/* Edit mode checkbox */}
                          {editMode && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                selectedItems.has(item.id)
                                  ? ''
                                  : 'border-zinc-600'
                              }`}
                              style={selectedItems.has(item.id) ? { backgroundColor: '#fd6159', borderColor: '#fd6159' } : {}}
                            >
                              {selectedItems.has(item.id) && (
                                <Check className="h-3.5 w-3.5 text-white" />
                              )}
                            </motion.div>
                          )}

                          {/* Thumbnail */}
                          <div className="h-16 w-16 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0">
                            {item.thumbnail_url || item.image_url ? (
                              <img
                                src={item.thumbnail_url || item.image_url}
                                alt={item.title || item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                {item._type === 'VIDEO' ? (
                                  <Play className="h-6 w-6 text-zinc-600" />
                                ) : item._type === 'RECIPE' ? (
                                  <UtensilsCrossed className="h-6 w-6 text-zinc-600" />
                                ) : (
                                  <MapPin className="h-6 w-6 text-zinc-600" />
                                )}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate">
                              {item.title || item.name}
                            </h3>
                            <p className="text-sm text-zinc-500 capitalize">{item._type.toLowerCase()}</p>
                          </div>

                          {/* Actions (when not in edit mode) */}
                          {!editMode && (
                            <div className="flex items-center gap-1">
                              {item._type === 'VIDEO' && item.restaurant && (
                                <button
                                  type="button"
                                  aria-label="View restaurant"
                                  onClick={() => navigate(`/restaurant/${item.restaurant.id}`)}
                                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                >
                                  <ChevronRight className="h-5 w-5 text-zinc-400" />
                                </button>
                              )}
                              <button
                                type="button"
                                aria-label="Remove from collection"
                                onClick={() => removeFromCollection(item.id)}
                                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-red-500/10 transition-colors group"
                              >
                                <Trash2 className="h-4 w-4 text-zinc-400 group-hover:text-red-400" />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Delete Selected Button (Edit Mode) */}
                <AnimatePresence>
                  {editMode && selectedItems.size > 0 && (
                    <motion.div
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 100, opacity: 0 }}
                      className="absolute bottom-20 left-4 right-4"
                    >
                      <Button
                        onClick={deleteSelectedItems}
                        className="w-full h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-medium"
                      >
                        <Trash2 className="h-5 w-5 mr-2" />
                        Delete {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
