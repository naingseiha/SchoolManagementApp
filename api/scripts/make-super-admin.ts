import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function makeSuperAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('❌ Usage: ts-node make-super-admin.ts <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, isSuperAdmin: true, firstName: true, lastName: true }
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    if (user.role !== 'ADMIN') {
      console.error(`❌ User ${email} is not an admin (role: ${user.role})`);
      process.exit(1);
    }

    if (user.isSuperAdmin) {
      console.log(`✅ User ${email} is already a Super Admin`);
      process.exit(0);
    }

    await prisma.user.update({
      where: { email },
      data: { isSuperAdmin: true }
    });

    console.log(`✅ Successfully made ${user.firstName} ${user.lastName} (${email}) a Super Admin`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeSuperAdmin();
