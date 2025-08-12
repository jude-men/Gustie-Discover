import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Sports',
    description: 'Athletic events, games, and sports activities',
    color: '#FF6B6B',
    icon: 'sports'
  },
  {
    name: 'Academic',
    description: 'Lectures, workshops, and educational events',
    color: '#4ECDC4',
    icon: 'academic'
  },
  {
    name: 'Social',
    description: 'Social gatherings, parties, and community events',
    color: '#45B7D1',
    icon: 'social'
  },
  {
    name: 'Cultural',
    description: 'Art shows, concerts, and cultural celebrations',
    color: '#F7DC6F',
    icon: 'cultural'
  },
  {
    name: 'Community Service',
    description: 'Volunteer work and community outreach',
    color: '#BB8FCE',
    icon: 'volunteer'
  },
  {
    name: 'Food & Dining',
    description: 'Food events, dining experiences, and culinary activities',
    color: '#F8C471',
    icon: 'food'
  }
];

const sampleUsers = [
  {
    email: 'admin@gustavus.edu',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN' as const
  },
  {
    email: 'senate@gustavus.edu',
    username: 'student_senate',
    firstName: 'Student',
    lastName: 'Senate',
    role: 'STUDENT_SENATE' as const
  },
  {
    email: 'john.doe@gustavus.edu',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    role: 'STUDENT' as const
  },
  {
    email: 'jane.smith@gustavus.edu',
    username: 'janesmith',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'STUDENT' as const
  }
];

async function main() {
  console.log('Starting database seed...');

  // Create categories
  console.log('Creating categories...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }

  // Create sample users
  console.log('Creating sample users...');
  for (const user of sampleUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user
    });
  }

  // Get created users and categories for sample activities
  const users = await prisma.user.findMany();
  const createdCategories = await prisma.category.findMany();

  // Create sample activities
  console.log('Creating sample activities...');
  const sampleActivities = [
    {
      title: 'Gustie Basketball Game vs. Carleton',
      description: 'Come cheer on the Gusties as they take on Carleton College in an exciting basketball matchup!',
      location: 'Lund Arena',
      startTime: new Date('2024-02-15T19:00:00Z'),
      endTime: new Date('2024-02-15T21:00:00Z'),
      categoryId: createdCategories.find(c => c.name === 'Sports')?.id!,
      authorId: users.find(u => u.role === 'STUDENT_SENATE')?.id!,
      tags: JSON.stringify(['basketball', 'sports', 'rivalry']),
      maxAttendees: 500
    },
    {
      title: 'Study Abroad Information Session',
      description: 'Learn about exciting study abroad opportunities available to Gustavus students.',
      location: 'Alumni Hall 104',
      startTime: new Date('2024-02-20T16:00:00Z'),
      endTime: new Date('2024-02-20T17:30:00Z'),
      categoryId: createdCategories.find(c => c.name === 'Academic')?.id!,
      authorId: users.find(u => u.role === 'ADMIN')?.id!,
      tags: JSON.stringify(['study-abroad', 'information', 'global'])
    },
    {
      title: 'Winter Formal Dance',
      description: 'Join us for an elegant evening of dancing, music, and fun with your fellow Gusties!',
      location: 'Campus Center Ballroom',
      startTime: new Date('2024-02-25T20:00:00Z'),
      endTime: new Date('2024-02-26T01:00:00Z'),
      categoryId: createdCategories.find(c => c.name === 'Social')?.id!,
      authorId: users.find(u => u.role === 'STUDENT_SENATE')?.id!,
      tags: JSON.stringify(['formal', 'dance', 'social']),
      maxAttendees: 200
    },
    {
      title: 'Jazz Ensemble Concert',
      description: 'Experience the smooth sounds of the Gustavus Jazz Ensemble in this evening performance.',
      location: 'Jussi Björling Recital Hall',
      startTime: new Date('2024-03-01T19:30:00Z'),
      endTime: new Date('2024-03-01T21:00:00Z'),
      categoryId: createdCategories.find(c => c.name === 'Cultural')?.id!,
      authorId: users.find(u => u.username === 'johndoe')?.id!,
      tags: JSON.stringify(['music', 'concert', 'jazz'])
    },
    {
      title: 'Community Garden Volunteer Day',
      description: 'Help maintain the campus community garden and learn about sustainable gardening practices.',
      location: 'Campus Community Garden',
      startTime: new Date('2024-03-05T10:00:00Z'),
      endTime: new Date('2024-03-05T14:00:00Z'),
      categoryId: createdCategories.find(c => c.name === 'Community Service')?.id!,
      authorId: users.find(u => u.username === 'janesmith')?.id!,
      tags: JSON.stringify(['volunteering', 'environment', 'community']),
      maxAttendees: 30
    },
    {
      title: 'International Food Festival',
      description: 'Taste delicious foods from around the world prepared by our international student community.',
      location: 'Campus Center Marketplace',
      startTime: new Date('2024-03-10T17:00:00Z'),
      endTime: new Date('2024-03-10T20:00:00Z'),
      categoryId: createdCategories.find(c => c.name === 'Food & Dining')?.id!,
      authorId: users.find(u => u.role === 'STUDENT_SENATE')?.id!,
      tags: JSON.stringify(['food', 'international', 'cultural']),
      maxAttendees: 150
    }
  ];

  for (const activity of sampleActivities) {
    await prisma.activity.create({
      data: activity
    });
  }

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 