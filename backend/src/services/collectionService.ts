import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';

export async function getUserCollections(userId: string) {
  const { data, error } = await supabase
    .from('collections')
    .select(`
      *,
      collection_items (
        id,
        item_id,
        item_type
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError(`Failed to fetch collections: ${error.message}`, 500);
  }

  return data || [];
}

export async function getCollectionById(collectionId: string, userId: string) {
  const { data, error } = await supabase
    .from('collections')
    .select(`
      *,
      collection_items (*)
    `)
    .eq('id', collectionId)
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new AppError(`Collection not found: ${error.message}`, 404);
  }

  return data;
}

export async function createCollection(
  name: string,
  type: 'RESTAURANT' | 'RECIPE',
  userId: string
) {
  const { data, error } = await supabase
    .from('collections')
    .insert({
      name,
      type,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw new AppError(`Failed to create collection: ${error.message}`, 500);
  }

  return data;
}

export async function deleteCollection(collectionId: string, userId: string) {
  // Items will be deleted via CASCADE
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId)
    .eq('user_id', userId);

  if (error) {
    throw new AppError(`Failed to delete collection: ${error.message}`, 500);
  }

  return { success: true };
}

export async function addItemToCollection(
  collectionId: string,
  itemId: string,
  itemType: 'RESTAURANT' | 'VIDEO' | 'RECIPE',
  userId: string
) {
  // Verify collection belongs to user
  const { data: collection } = await supabase
    .from('collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', userId)
    .single();

  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  // Check if item already exists
  const { data: existing } = await supabase
    .from('collection_items')
    .select('id')
    .eq('collection_id', collectionId)
    .eq('item_id', itemId)
    .single();

  if (existing) {
    throw new AppError('Item already in collection', 400);
  }

  const { data, error } = await supabase
    .from('collection_items')
    .insert({
      collection_id: collectionId,
      item_id: itemId,
      item_type: itemType,
    })
    .select()
    .single();

  if (error) {
    throw new AppError(`Failed to add item: ${error.message}`, 500);
  }

  return data;
}

export async function removeItemFromCollection(
  collectionId: string,
  itemId: string,
  userId: string
) {
  // Verify collection belongs to user
  const { data: collection } = await supabase
    .from('collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', userId)
    .single();

  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  const { error } = await supabase
    .from('collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .eq('item_id', itemId);

  if (error) {
    throw new AppError(`Failed to remove item: ${error.message}`, 500);
  }

  return { success: true };
}
