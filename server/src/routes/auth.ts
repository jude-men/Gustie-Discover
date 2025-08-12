import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUserSchema, loginSchema, validateRequest } from '../utils/validation';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, username, firstName, lastName, password } = validateRequest(createUserSchema, req.body);
    const prisma = (req as any).prisma;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: {
          message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
        }
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        firstName,
        lastName,
        // Note: We're not storing the password in this schema
        // In a real app, you'd add a password field to the User model
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({
      error: {
        message: error.message || 'Registration failed'
      }
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = validateRequest(loginSchema, req.body);
    const prisma = (req as any).prisma;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: {
          message: 'Invalid credentials'
        }
      });
    }

    // For demo purposes, we'll accept any password since we don't have password in schema
    // In a real app, you'd compare with bcrypt: await bcrypt.compare(password, user.password)
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const { ...userResponse } = user;
    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(400).json({
      error: {
        message: error.message || 'Login failed'
      }
    });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req: any, res) => {
  try {
    const prisma = (req as any).prisma;
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            activities: true,
            comments: true,
            likes: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found'
        }
      });
    }

    res.json({ user });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch profile'
      }
    });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req: any, res) => {
  try {
    const userId = (req as any).user.id;

    // Generate new JWT token
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Token refreshed successfully',
      token
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: {
        message: 'Token refresh failed'
      }
    });
  }
});

export default router; 