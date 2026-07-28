import { Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import Downloadable from '../models/Downloadable';
import { AuthRequest } from '../middleware/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const deleteCloudinaryFile = async (publicId: string) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch {
    // ignore if already deleted
  }
};

export const createDownloadable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const downloadable = await Downloadable.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Downloadable created successfully',
      data: downloadable
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create downloadable',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getDownloadables = async (req: any, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: any = { status: 'published', tier: 'free' };

    const [items, total] = await Promise.all([
      Downloadable.find(filter).sort({ order: -1, createdAt: -1 }).skip(skip).limit(limit),
      Downloadable.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch downloadables',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAllDownloadablesAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Downloadable.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Downloadable.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch downloadables',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateDownloadable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await Downloadable.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Downloadable not found' });
      return;
    }

    if (req.body.file && req.body.file !== existing.file && existing.filePublicId) {
      await deleteCloudinaryFile(existing.filePublicId);
    }

    const downloadable = await Downloadable.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Downloadable updated successfully',
      data: downloadable
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update downloadable',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteDownloadable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const downloadable = await Downloadable.findByIdAndDelete(id);

    if (!downloadable) {
      res.status(404).json({ success: false, message: 'Downloadable not found' });
      return;
    }

    if (downloadable.filePublicId) {
      await deleteCloudinaryFile(downloadable.filePublicId);
    }

    res.json({
      success: true,
      message: 'Downloadable deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete downloadable',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
