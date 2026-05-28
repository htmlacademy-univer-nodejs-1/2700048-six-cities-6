import mongoose from 'mongoose';

export interface CommentDocument extends mongoose.Document {
  text: string;
  postDate: Date;
  rating: number;
  offerId: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const COMMENT_SCHEMA = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 1024,
    },
    postDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const CommentModel = mongoose.model<CommentDocument>('Comment', COMMENT_SCHEMA);
