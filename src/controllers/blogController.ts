import { Response, Request } from 'express';
import Blog from '../models/Blog';
import { AuthRequest } from '../middleware/auth';

export const createBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const slug = req.body.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);

    const blog = await Blog.create({
      ...req.body,
      slug
    });

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create blog',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getBlogs = async (req: Request & { query: Record<string, string> }, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { status: 'published' };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.featured === 'true') {
      filter.featured = true;
    }

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        blogs,
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
      message: 'Failed to get blogs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getBlogBySlug = async (req: Request & { params: { slug: string } }, res: Response): Promise<void> => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });

    if (!blog) {
      res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
      return;
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get blog',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { identifier } = req.params;
    
    let blog;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findByIdAndUpdate(
        identifier,
        req.body,
        { new: true, runValidators: true }
      );
    } else {
      blog = await Blog.findOneAndUpdate(
        { slug: identifier },
        req.body,
        { new: true, runValidators: true }
      );
    }

    if (!blog) {
      res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update blog',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { identifier } = req.params;
    
    let blog;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findByIdAndDelete(identifier);
    } else {
      blog = await Blog.findOneAndDelete({ slug: identifier });
    }

    if (!blog) {
      res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAllBlogsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const includeDrafts = req.query.includeDrafts === 'true';

    const filter = includeDrafts ? {} : { status: 'published' };

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        blogs,
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
      message: 'Failed to get blogs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getBlogCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Blog.distinct('category');
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};