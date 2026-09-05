import { useCallback } from 'react';
import { useSavedStore } from '@/store';
import { api } from '@/services/api';
import { SavedPlace, SavedList, SavedListItem } from '@/types';

export const useSaved = () => {
  const { savedPlaces, lists, activeList, loading, error, setLists, addList, updateList, removeList, setActiveList, setLoading, setError } = useSavedStore();

  const loadSavedPlaces = useCallback(async (userId: string, listId?: string) => {
    setLoading(true);
    try {
      const response = await api.saved.places.list();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const savePlace = useCallback(async (userId: string, placeId: string, placeData: any, listId?: string, notes?: string) => {
    try {
      const response = await api.saved.places.add({ place_id: placeId, list_id: listId, notes });
      return response.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [setError]);

  const unsavePlace = useCallback(async (userId: string, placeId: string, listId?: string) => {
    try {
      await api.saved.places.remove(placeId);
    } catch (err: any) {
      setError(err.message);
    }
  }, [setError]);

  const loadLists = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const response = await api.saved.lists.list();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const createList = useCallback(async (userId: string, name: string, description?: string, isShared = false) => {
    try {
      const response = await api.saved.lists.create({ name, description, is_shared: isShared });
      return response.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [setError]);

  const updateListHook = useCallback(async (listId: string, data: { name?: string; description?: string; isShared?: boolean; coverImage?: string }) => {
    try {
      const response = await api.saved.lists.update(listId, data);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [setError]);

  const deleteList = useCallback(async (listId: string) => {
    try {
      await api.saved.lists.delete(listId);
    } catch (err: any) {
      setError(err.message);
    }
  }, [setError]);

  const loadListItems = useCallback(async (listId: string) => {
    try {
      const response = await api.saved.lists.items(listId);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  }, [setError]);

  const addListItem = useCallback(async (listId: string, placeId: string, placeData: any, notes?: string, position?: number) => {
    try {
      const response = await api.saved.lists.addItem(listId, { place_id: placeId, notes, position });
      return response.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [setError]);

  const removeListItem = useCallback(async (listId: string, itemId: string) => {
    try {
      await api.saved.lists.removeItem(listId, itemId);
    } catch (err: any) {
      setError(err.message);
    }
  }, [setError]);

  const reorderListItems = useCallback(async (listId: string, items: { id: string; position: number }[]) => {
    try {
      await api.saved.lists.reorderItems(listId, items);
    } catch (err: any) {
      setError(err.message);
    }
  }, [setError]);

  const loadListMembers = useCallback(async (listId: string) => {
    try {
      const response = await api.saved.lists.members(listId);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  }, [setError]);

  const inviteToList = useCallback(async (listId: string, email: string, role: 'editor' | 'viewer') => {
    try {
      const response = await api.saved.lists.invite(listId, { email, role });
      return response.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [setError]);

  const removeListMember = useCallback(async (listId: string, memberId: string) => {
    try {
      await api.saved.lists.removeMember(listId, memberId);
    } catch (err: any) {
      setError(err.message);
    }
  }, [setError]);

  const updateMemberRole = useCallback(async (listId: string, memberId: string, role: 'editor' | 'viewer') => {
    try {
      const response = await api.saved.lists.updateMember(listId, memberId, { role });
      return response.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [setError]);

  const acceptListInvite = useCallback(async (token: string) => {
    try {
      const response = await api.saved.lists.acceptInvite(token);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [setError]);

  return {
    savedPlaces,
    lists,
    activeList,
    loading,
    error,
    loadSavedPlaces,
    savePlace,
    unsavePlace,
    loadLists,
    createList,
    updateList,
    deleteList,
    setActiveList,
    loadListItems,
    addListItem,
    removeListItem,
    reorderListItems,
    loadListMembers,
    inviteToList,
    removeListMember,
    updateMemberRole,
    acceptListInvite,
  };
};