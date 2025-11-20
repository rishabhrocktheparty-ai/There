import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin users
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const userPassword = await bcrypt.hash('User123!', 12);

  // Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@there.ai' },
    update: {},
    create: {
      email: 'admin@there.ai',
      authProvider: 'PASSWORD',
      passwordHash: adminPassword,
      displayName: 'Super Admin',
      locale: 'en',
      timezone: 'UTC',
      adminProfile: {
        create: {
          role: 'SUPER_ADMIN',
        },
      },
    },
  });
  console.log('✅ Created Super Admin:', superAdmin.email);

  // Create Config Manager
  const configManager = await prisma.user.upsert({
    where: { email: 'config@there.ai' },
    update: {},
    create: {
      email: 'config@there.ai',
      authProvider: 'PASSWORD',
      passwordHash: adminPassword,
      displayName: 'Config Manager',
      locale: 'en',
      timezone: 'UTC',
      adminProfile: {
        create: {
          role: 'CONFIG_MANAGER',
        },
      },
    },
  });
  console.log('✅ Created Config Manager:', configManager.email);

  // Create Viewer Admin
  const viewerAdmin = await prisma.user.upsert({
    where: { email: 'viewer@there.ai' },
    update: {},
    create: {
      email: 'viewer@there.ai',
      authProvider: 'PASSWORD',
      passwordHash: adminPassword,
      displayName: 'Viewer Admin',
      locale: 'en',
      timezone: 'UTC',
      adminProfile: {
        create: {
          role: 'VIEWER',
        },
      },
    },
  });
  console.log('✅ Created Viewer Admin:', viewerAdmin.email);

  // Create regular users
  const regularUser1 = await prisma.user.upsert({
    where: { email: 'user@there.ai' },
    update: {},
    create: {
      email: 'user@there.ai',
      authProvider: 'PASSWORD',
      passwordHash: userPassword,
      displayName: 'Test User',
      locale: 'en',
      timezone: 'America/New_York',
      preferences: {
        theme: 'light',
        notifications: true,
      },
    },
  });
  console.log('✅ Created Regular User:', regularUser1.email);

  const regularUser2 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      authProvider: 'PASSWORD',
      passwordHash: userPassword,
      displayName: 'John Doe',
      locale: 'en',
      timezone: 'America/Los_Angeles',
    },
  });
  console.log('✅ Created Regular User:', regularUser2.email);

  // Create social login user (Google)
  const socialUser = await prisma.user.upsert({
    where: { email: 'social@gmail.com' },
    update: {},
    create: {
      email: 'social@gmail.com',
      authProvider: 'GOOGLE',
      externalId: 'google-123456789',
      displayName: 'Social User',
      locale: 'en',
      timezone: 'UTC',
    },
  });
  console.log('✅ Created Social Login User:', socialUser.email);

  // Create sample role templates
  const fatherTemplate = await prisma.roleTemplate.upsert({
    where: { key: 'father_supportive' },
    update: {},
    create: {
      type: 'FATHER',
      key: 'father_supportive',
      displayName: 'Supportive Father',
      description: 'A warm, encouraging father figure',
      defaultSettings: {
        tone: 'supportive',
        communication_style: 'encouraging',
        advice_level: 'moderate',
      },
    },
  });
  console.log('✅ Created Role Template:', fatherTemplate.displayName);

  const mentorTemplate = await prisma.roleTemplate.upsert({
    where: { key: 'mentor_professional' },
    update: {},
    create: {
      type: 'MENTOR',
      key: 'mentor_professional',
      displayName: 'Professional Mentor',
      description: 'A career-focused mentor providing guidance',
      defaultSettings: {
        tone: 'professional',
        communication_style: 'direct',
        advice_level: 'high',
      },
    },
  });
  console.log('✅ Created Role Template:', mentorTemplate.displayName);

  // Create sample ethical config
  const ethicalConfig = await prisma.ethicalConfig.upsert({
    where: { name: 'default_ethical_boundaries' },
    update: {},
    create: {
      name: 'default_ethical_boundaries',
      description: 'Default ethical boundaries for AI relationships',
      latestVersion: 1,
      isActive: true,
      versions: {
        create: {
          version: 1,
          data: {
            prohibited_topics: ['violence', 'illegal_activities', 'harmful_content'],
            response_guidelines: {
              empathy_level: 'high',
              formality: 'moderate',
              boundaries: ['no_medical_advice', 'no_legal_advice', 'no_financial_advice'],
            },
            content_filters: {
              profanity: 'moderate',
              sensitive_topics: 'careful',
            },
          },
        },
      },
    },
  });
  console.log('✅ Created Ethical Config:', ethicalConfig.name);

  // Create sample cultural parameters
  const usaCultural = await prisma.culturalParameter.upsert({
    where: { regionCode_cultureKey: { regionCode: 'US', cultureKey: 'communication_style' } },
    update: {},
    create: {
      regionCode: 'US',
      cultureKey: 'communication_style',
      settings: {
        directness: 'high',
        formality: 'low',
        personal_space: 'large',
        time_orientation: 'future',
      },
    },
  });
  console.log('✅ Created Cultural Parameter: US');

  const japanCultural = await prisma.culturalParameter.upsert({
    where: { regionCode_cultureKey: { regionCode: 'JP', cultureKey: 'communication_style' } },
    update: {},
    create: {
      regionCode: 'JP',
      cultureKey: 'communication_style',
      settings: {
        directness: 'low',
        formality: 'high',
        personal_space: 'small',
        time_orientation: 'past',
        respect_hierarchy: true,
      },
    },
  });
  console.log('✅ Created Cultural Parameter: Japan');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin Logins:');
  console.log('  Email: admin@there.ai');
  console.log('  Email: config@there.ai');
  console.log('  Email: viewer@there.ai');
  console.log('  Password: Admin123!');
  console.log('\nUser Logins:');
  console.log('  Email: user@there.ai');
  console.log('  Email: john@example.com');
  console.log('  Password: User123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
