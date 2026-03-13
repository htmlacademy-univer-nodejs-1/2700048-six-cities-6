import type { CityName, OfferType, Facility } from '../types.js';

export type RemoteOffer = {
  title: string;
  description: string;
  city: CityName;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  type: OfferType;
  bedrooms: number;
  maxAdults: number;
  price: number;
  rating: number;
  goods: Facility[];
  location: {
    latitude: number;
    longitude: number;
  };
};

