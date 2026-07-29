import { Response } from 'express';
import Lead from '../models/Lead';
import SeminarRegistration from '../models/SeminarRegistration';
import { AuthRequest } from '../middleware/auth';

export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const [items, total] = await Promise.all([
      Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Lead.countDocuments(filter)
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
      message: 'Failed to fetch leads',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    const registrations = await SeminarRegistration.find({ email: lead.email })
      .populate('seminar', 'title dateTime')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { lead, registrations }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await Lead.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    const lead = await Lead.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update lead',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete lead',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const upsertLeadFromRegistration = async (data: {
  name: string;
  email: string;
  phone?: string;
  country: string;
  source: string;
}): Promise<void> => {
  const existing = await Lead.findOne({ email: data.email.toLowerCase() });

  if (existing) {
    existing.registrationCount += 1;
    existing.name = data.name;
    if (data.phone) existing.phone = data.phone;
    if (data.country) existing.country = data.country;
    await existing.save();
  } else {
    await Lead.create({
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      country: data.country,
      source: data.source,
      registrationCount: 1
    });
  }
};