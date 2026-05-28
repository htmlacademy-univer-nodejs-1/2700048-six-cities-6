import mongoose from 'mongoose';

import type { UserType } from '../../types.js';
import { USER_TYPES } from '../../types.js';

export interface UserDocument extends mongoose.Document {
  name: string;
  email: string;
  avatarUrl?: string;
  password: string;
  type: UserType;
  favorites: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const USER_SCHEMA = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 15,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatarUrl: {
      type: String,
      default: undefined,
    },
    password: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [...USER_TYPES],
    },
    favorites: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Offer',
      default: [],
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<UserDocument>('User', USER_SCHEMA);
