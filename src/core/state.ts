import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Place, SavedList } from './types';

const storageKey = '@oria/saved';
type StoredState = Pick<AppState, 'saved' | 'lists'>;
const write = (state: StoredState) => AsyncStorage.setItem(storageKey, JSON.stringify(state));

type AppState = {
  saved: Place[];
  lists: SavedList[];
  addSaved: (place: Place) => void;
  removeSaved: (id: string) => void;
  createList: (name: string) => void;
};

export const useAppState = create<AppState>((set, get) => ({
  saved: [], lists: [],
  addSaved: (place) => set((state) => {
    const next = state.saved.some((item) => item.id === place.id) ? state : { saved: [place, ...state.saved] };
    write({ saved: next.saved, lists: state.lists }); return next;
  }),
  removeSaved: (id) => set((state) => { const next = { saved: state.saved.filter((item) => item.id !== id) }; write({ saved: next.saved, lists: state.lists }); return next; }),
  createList: (name) => set((state) => { const next = { lists: [{ id: `list-${Date.now()}`, name, places: [], createdAt: new Date().toISOString() }, ...state.lists] }; write({ saved: state.saved, lists: next.lists }); return next; }),
}));

AsyncStorage.getItem(storageKey).then((raw) => {
  if (!raw) return;
  const state = JSON.parse(raw) as StoredState;
  useAppState.setState({ saved: state.saved || [], lists: state.lists || [] });
}).catch(() => undefined);
