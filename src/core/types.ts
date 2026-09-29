export type Coordinates = { latitude: number; longitude: number };

export type Place = {
  id: string;
  name: string;
  category: string;
  icon: string;
  latitude: number;
  longitude: number;
  address?: string;
  distance?: number;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
};

export type SavedList = { id: string; name: string; places: Place[]; createdAt: string };
