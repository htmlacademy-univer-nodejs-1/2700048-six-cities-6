export const CITY_NAMES = [
  'Paris',
  'Cologne',
  'Brussels',
  'Amsterdam',
  'Hamburg',
  'Dusseldorf',
] as const;

export type CityName = typeof CITY_NAMES[number];

export const OFFER_TYPES = ['apartment', 'house', 'room', 'hotel'] as const;
export type OfferType = typeof OFFER_TYPES[number];

export const USER_TYPES = ['ordinary', 'pro'] as const;
export type UserType = typeof USER_TYPES[number];

export const FACILITIES = [
  'Breakfast',
  'Air conditioning',
  'Laptop friendly workspace',
  'Baby seat',
  'Washer',
  'Towels',
  'Fridge',
] as const;
export type Facility = typeof FACILITIES[number];

export type ISODateString = string;

export type Location = {
  latitude: number;
  longitude: number;
};

export type User = {
  name: string;
  email: string;
  avatarUrl?: string;
  type: UserType;
};

export type NewUser = User & {
  password: string;
};

export type Offer = {
  title: string;
  description: string;
  postDate: Date;
  city: CityName;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  type: OfferType;
  bedrooms: number;
  maxAdults: number;
  price: number;
  goods: Facility[];
  host: User;
  location: Location;
};

export type OfferTSVRow = {
  title: string;
  description: string;
  postDate: ISODateString;
  city: CityName;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  type: OfferType;
  bedrooms: number;
  maxAdults: number;
  price: number;
  goods: Facility[];
  authorName: string;
  authorEmail: string;
  authorAvatarUrl: string;
  authorPassword: string;
  authorType: UserType;
  latitude: number;
  longitude: number;
};

