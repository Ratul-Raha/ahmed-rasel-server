import mongoose, { Document, Schema } from 'mongoose';

export interface ILead extends Document {
  name: string;
  email: string;
  phone: string;
  country: string;
  source: string;
  registrationCount: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    country: {
      type: String,
      trim: true,
      default: ''
    },
    source: {
      type: String,
      required: [true, 'Source is required'],
      trim: true
    },
    registrationCount: {
      type: Number,
      default: 1
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

leadSchema.index({ email: 1 }, { unique: true });
leadSchema.index({ source: 1 });
leadSchema.index({ createdAt: -1 });

export default mongoose.model<ILead>('Lead', leadSchema);