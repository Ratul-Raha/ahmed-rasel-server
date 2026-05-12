import { Response, Request } from 'express';
import Gallery from '../models/Gallery';
import { AuthRequest } from '../middleware/auth';

export const createGalleryItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const galleryItem = await Gallery.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Gallery item created successfully',
      data: galleryItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create gallery item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getGalleryItems = async (req: Request & { query: Record<string, string> }, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }

    if (req.query.featured === 'true') {
      filter.featured = true;
    }

    const [galleryItems, total] = await Promise.all([
      Gallery.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Gallery.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        galleryItems,
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
      message: 'Failed to get gallery items',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateGalleryItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const galleryItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!galleryItem) {
      res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Gallery item updated successfully',
      data: galleryItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update gallery item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteGalleryItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const galleryItem = await Gallery.findByIdAndDelete(req.params.id);

    if (!galleryItem) {
      res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete gallery item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAllGalleryAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [galleryItems, total] = await Promise.all([
      Gallery.find()
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Gallery.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        galleryItems,
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
      message: 'Failed to get gallery items',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const reorderGallery = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      res.status(400).json({
        success: false,
        message: 'Items must be an array'
      });
      return;
    }

    // Update order for each item
    const updatePromises = items.map((item: { id: string; order: number }) =>
      Gallery.findByIdAndUpdate(item.id, { order: item.order })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Gallery reordered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reorder gallery',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};