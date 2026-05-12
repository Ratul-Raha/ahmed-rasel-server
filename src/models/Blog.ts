import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  featured: boolean;
  readTime: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    excerpt: {
      type: String,
      maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    coverImage: {
      type: String,
      default: ''
    },
    author: {
      type: String,
      default: 'Ahmed Rasel'
    },
    category: {
      type: String,
      required: [true, 'Category is required']
    },
    tags: [{
      type: String,
      trim: true
    }],
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },
    featured: {
      type: Boolean,
      default: false
    },
    readTime: {
      type: Number,
      default: 5
    },
    views: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ slug: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });

blogSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);
  }
  next();
});

blogSchema.pre('save', function (next) {
  const wordsPerMinute = 200;
  const words = this.content.split(/\s+/).length;
  this.readTime = Math.ceil(words / wordsPerMinute);
  next();
});

export default mongoose.model<IBlog>('Blog', blogSchema);