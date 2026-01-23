import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');



  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@resumebuilder.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminName = process.env.ADMIN_NAME || 'Admin User';

  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

  // Upsert admin (create if doesn't exist, update if exists)
  const admin = await prisma.admin.upsert({
    where: {
      email: adminEmail,
    },
    update: {
      name: adminName,
      password_hash: passwordHash,
      is_active: true,
    },
    create: {
      email: adminEmail,
      name: adminName,
      password_hash: passwordHash,
      is_active: true,
    },
  });

  console.log(`✅ Admin created/updated: ${admin.name} (${admin.email})`);
  console.log(`   Default credentials: ${adminEmail} / ${adminPassword}`);
  console.log('   ⚠️  Please change the default password after first login!');

  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
