// Collections API calls
import api from './client';

export interface Collection {
  id: string;
  name: string;
  type: 'RESTAURANT' | 'RECIPE';
  user_id: string;
  created_at?: string;
  collection_items?: CollectionItem[];
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  item_id: string;
  item_type: 'RESTAURANT' | 'VIDEO' | 'RECIPE';
  created_at?: string;
}

export const collectionsApi = {
  // Get user's collections
  getAll: (token: string) =>
    api.get<{ success: boolean; data: Collection[] }>('/collections', token),

  // Get collection by ID
  getById: (id: string, token: string) =>
    api.get<{ success: boolean; data: Collection }>(`/collections/${id}`, token),

  // Create collection
  create: (name: string, type: 'RESTAURANT' | 'RECIPE', token: string) =>
    api.post<{ success: boolean; data: Collection }>(
      '/collections',
      { name, type },
      token
    ),

  // Delete collection
  delete: (id: string, token: string) =>
    api.delete<{ success: boolean }>(`/collections/${id}`, token),

  // Add item to collection
  addItem: (
    collectionId: string,
    itemId: string,
    itemType: 'RESTAURANT' | 'VIDEO' | 'RECIPE',
    token: string
  ) =>
    api.post<{ success: boolean; data: CollectionItem }>(
      `/collections/${collectionId}/items`,
      { itemId, itemType },
      token
    ),

  // Remove item from collection
  removeItem: (collectionId: string, itemId: string, token: string) =>
    api.delete<{ success: boolean }>(
      `/collections/${collectionId}/items/${itemId}`,
      token
    ),
};
