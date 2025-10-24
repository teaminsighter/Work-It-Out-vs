const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding admin users...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 12);
  const managerPassword = await bcrypt.hash('manager123', 12);

  // Create Super Admin user
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@localpower.com' },
    update: {
      password: adminPassword,
      role: 'SUPER_ADMIN'
    },
    create: {
      email: 'admin@localpower.com',
      name: 'Super Admin',
      firstName: 'Super',
      lastName: 'Admin',
      password: adminPassword,
      role: 'SUPER_ADMIN'
    }
  });

  // Create Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'manager@localpower.com' },
    update: {
      password: managerPassword,
      role: 'ADMIN'
    },
    create: {
      email: 'manager@localpower.com',
      name: 'Admin Manager',
      firstName: 'Admin',
      lastName: 'Manager',
      password: managerPassword,
      role: 'ADMIN'
    }
  });

  console.log('✅ Admin users seeded:');
  console.log(`   Super Admin: ${superAdmin.email} (${superAdmin.role})`);
  console.log(`   Admin: ${admin.email} (${admin.role})`);
  console.log('');
  console.log('🔑 Login credentials:');
  console.log('   Super Admin: admin@localpower.com / admin123');
  console.log('   Admin: manager@localpower.com / manager123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });