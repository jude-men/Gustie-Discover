import { z } from 'zod';

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username too long'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Activity validation schemas
export const createActivitySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  location: z.string().optional(),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format').optional(),
  isRecurring: z.boolean().default(false),
  categoryId: z.string().cuid('Invalid category ID'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  maxAttendees: z.number().int().positive('Max attendees must be positive').optional(),
  tags: z.array(z.string()).default([]),
});

export const updateActivitySchema = createActivitySchema.partial();

export const activityFiltersSchema = z.object({
  category: z.string().optional(),
  status: z.enum(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  page: z.string().transform(val => parseInt(val, 10)).default(() => 1),
  limit: z.string().transform(val => parseInt(val, 10)).default(() => 20),
});

// Category validation schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color format'),
  icon: z.string().min(1, 'Icon is required'),
});

export const updateCategorySchema = createCategorySchema.partial();

// Comment validation schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(500, 'Comment too long'),
  activityId: z.string().cuid('Invalid activity ID'),
});

// Validation helper
export const validateRequest = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }
    throw error;
  }
}; 