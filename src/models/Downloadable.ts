import mongoose, { Document, Schema } from 'mongoose';

export interface IDownloadable extends Document {
  title: string;
  description: string;
  file: string;
  status: 'draft' | 'published';
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
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
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
