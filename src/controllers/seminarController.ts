import { Response } from 'express';
import Seminar from '../models/Seminar';
import SeminarRegistration from '../models/SeminarRegistration';
import Lead from '../models/Lead';
import { AuthRequest } from '../middleware/auth';

export const createSeminar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const seminar = await Seminar.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Seminar created successfully',
      data: seminar
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create seminar',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getSeminars = async (req: any, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: any = { status: 'published' };

    const [items, total] = await Promise.all([
      Seminar.find(filter).sort({ dateTime: -1 }).skip(skip).limit(limit),
      Seminar.countDocuments(filter)
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
      message: 'Failed to fetch seminars',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getSeminar = async (req: any, res: Response): Promise<void> => {
  try {
    const seminar = await Seminar.findById(req.params.id);

    if (!seminar) {
      res.status(404).json({ success: false, message: 'Seminar not found' });
      return;
    }

    res.json({
      success: true,
      data: seminar
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seminar',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAllSeminarsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Seminar.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Seminar.countDocuments()
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
      message: 'Failed to fetch seminars',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateSeminar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await Seminar.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Seminar not found' });
      return;
    }

    const seminar = await Seminar.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Seminar updated successfully',
      data: seminar
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update seminar',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteSeminar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const seminar = await Seminar.findByIdAndDelete(id);

    if (!seminar) {
      res.status(404).json({ success: false, message: 'Seminar not found' });
      return;
    }

    await SeminarRegistration.deleteMany({ seminar: id });

    res.json({
      success: true,
      message: 'Seminar deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete seminar',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const registerForSeminar = async (req: any, res: Response): Promise<void> => {
  try {
    const { seminarId } = req.params;
    const { name, email, phone, country } = req.body;

    const seminar = await Seminar.findById(seminarId);
    if (!seminar) {
      res.status(404).json({ success: false, message: 'Seminar not found' });
      return;
    }

    if (seminar.status !== 'published') {
      res.status(400).json({ success: false, message: 'Seminar is not open for registration' });
      return;
    }

    const registration = await SeminarRegistration.create({
      seminar: seminarId,
      name,
      email,
      phone: phone || '',
      country
    });

    const existingLead = await Lead.findOne({ email: email.toLowerCase() });
    if (existingLead) {
      existingLead.registrationCount += 1;
      existingLead.name = name;
      if (phone) existingLead.phone = phone;
      if (country) existingLead.country = country;
      await existingLead.save();
    } else {
      await Lead.create({
        name,
        email,
        phone: phone || '',
        country,
        source: 'seminar',
        registrationCount: 1
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registered successfully',
      data: {
        registration,
        seminarUrl: seminar.url,
        seminarTitle: seminar.title
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to register for seminar',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getRegistrations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { seminarId } = req.params;

    const registrations = await SeminarRegistration.find({ seminar: seminarId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: registrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};