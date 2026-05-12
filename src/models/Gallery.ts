import mongoose, { Document, Schema } from 'mongoose';

export interface IGallery extends Document {
  title: string;
  titleBn: string;
  image: string;
  category: string;
  eventDate?: Date;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const gallerySchema = new Schema<IGallery>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    titleBn: {
      type: String,
      trim: true,
      default: ''
    },
    image: {
      type: String,
      required: [true, 'Image is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Seminar', 'Competition', 'Workshop', 'Summit', 'Event', 'Ceremony', 'Visit', 'Meeting', 'Launch', 'Interview', 'Other']
    },
    eventDate: {
      type: Date
    },
    featured: {
      type: Boolean,
      default: false
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

// Index for faster queries
gallerySchema.index({ category: 1 });
gallerySchema.index({ featured: 1 });
gallerySchema.index({ order: 1 });

export default mongoose.model<IGallery>('Gallery', gallerySchema);