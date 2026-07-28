import mongoose, { Document, Schema } from 'mongoose';

export interface IDownloadable extends Document {
  title: string;
  description: string;
  file: string;
  filePublicId: string;
  status: 'draft' | 'published';
  tier: 'free' | 'pro';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const downloadableSchema = new Schema<IDownloadable>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    file: {
      type: String,
      required: [true, 'File is required']
    },
    filePublicId: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },
    tier: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free'
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

downloadableSchema.index({ status: 1, order: -1, createdAt: -1 });

export default mongoose.model<IDownloadable>('Downloadable', downloadableSchema);
