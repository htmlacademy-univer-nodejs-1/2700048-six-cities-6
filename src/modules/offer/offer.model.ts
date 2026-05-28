import mongoose from 'mongoose';

import type { CityName, Facility, OfferType } from '../../types.js';
import { CITY_NAMES, FACILITIES, OFFER_TYPES } from '../../types.js';

const DEFAULT_OFFER_RATING = 1;

export interface OfferDocument extends mongoose.Document {
  title: string;
  description: string;
  postDate: Date;
  city: CityName;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  rating: number;
  type: OfferType;
  bedrooms: number;
  maxAdults: number;
  price: number;
  goods: Facility[];
  host: mongoose.Types.ObjectId;
  commentCount: number;
  latitude: number;
  longitude: number;
  createdAt: Date;
  updatedAt: Date;
}

const OFFER_SCHEMA = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 1024,
    },
    postDate: {
      type: Date,
      required: true,
    },
    city: {
      type: String,
      required: true,
      enum: [...CITY_NAMES],
    },
    previewImage: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    isPremium: {
      type: Boolean,
      required: true,
      default: false,
    },
    rating: {
      type: Number,
      default: DEFAULT_OFFER_RATING,
      min: 1,
      max: 5,
    },
    type: {
      type: String,
      required: true,
      enum: [...OFFER_TYPES],
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    maxAdults: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    price: {
      type: Number,
      required: true,
      min: 100,
      max: 100000,
    },
    goods: {
      type: [String],
      required: true,
      enum: [...FACILITIES],
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const OfferModel = mongoose.model<OfferDocument>('Offer', OFFER_SCHEMA);
