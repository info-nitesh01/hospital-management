import type { Request, Response } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../config/env';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
      return;
    }

    const user = {
      id: Date.now().toString(),
      name,
      email,
    };

    const token = jwt.sign(
      { id: user.id, email: user.email },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
      }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('registerUser error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
    });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    const user = {
      id: 'demo-user-1',
      name: 'Demo User',
      email,
    };

    const token = jwt.sign(
      { id: user.id, email: user.email },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
      }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('loginUser error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login user',
    });
  }
};
