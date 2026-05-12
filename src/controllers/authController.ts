import { Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import config from '../config/env';

interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface AuthReq {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const generateTokens = (userId: string, email: string, role: string) => {
  const accessToken = jwt.sign(
    { id: userId, email, role },
    config.JWT_SECRET,
    { expiresIn: '7d' as any }
  );

  const refreshToken = jwt.sign(
    { id: userId, email, role },
    config.JWT_REFRESH_SECRET,
    { expiresIn: '30d' as any }
  );

  return { accessToken, refreshToken };
};

export const register = async (req: any, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body as RegisterBody;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
      return;
    }

    const user = await User.create({
      email,
      password,
      name,
      role: 'admin'
    });

    const tokens = generateTokens(user.id, user.email, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user,
        ...tokens
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const login = async (req: any, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginBody;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    const tokens = generateTokens(user.id, user.email, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        ...tokens
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const refreshToken = async (req: any, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
      return;
    }

    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const tokens = generateTokens(user.id, user.email, user.role);

    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

export const getMe = async (req: AuthReq, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const logout = async (req: any, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};