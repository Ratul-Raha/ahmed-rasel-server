import mongoose, { Document, Schema } from 'mongoose';

export interface ISeminarRegistration extends Document {
  seminar: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

const seminarRegistrationSchema = new Schema<ISeminarRegistration>(
  {
    seminar: {
      type: Schema.Types.ObjectId,
      ref: 'Seminar',
      required: [true, 'Seminar ID is required']
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

seminarRegistrationSchema.index({ seminar: 1, email: 1 });

export default mongoose.model<ISeminarRegistration>('SeminarRegistration', seminarRegistrationSchema);