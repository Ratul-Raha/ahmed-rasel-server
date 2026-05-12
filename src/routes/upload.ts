import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = Router();

router.post('/', authenticate, authorize('admin', 'editor'), async (req: any, res: Response) => {
  try {
    const { image } = req.body;

    if (!image) {
      res.status(400).json({
        success: false,
        message: 'No image provided'
      });
      return;
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: 'ahmed-rasel/blogs'
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;