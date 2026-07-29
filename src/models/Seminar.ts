import mongoose, { Document, Schema } from 'mongoose';

export interface ISeminar extends Document {
  title: string;
  description: string;
  url: string;
  image: string;
  dateTime: Date;
  tier: 'free' | 'paid';
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const seminarSchema = new Schema<ISeminar>(
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
    url: {
      type: String,
      required: [true, 'Seminar URL is required'],
      trim: true
    },
    image: {
      type: String,
      default: ''
    },
    dateTime: {
      type: Date,
      required: [true, 'Date and time is required']
    },
    tier: {
      type: String,
      enum: ['free', 'paid'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    }
  },
  {
    timestamps: true
  }
);

seminarSchema.index({ status: 1, dateTime: -1 });

export default mongoose.model<ISeminar>('Seminar', seminarSchema);
