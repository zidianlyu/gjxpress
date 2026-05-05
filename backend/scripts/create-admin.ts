import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const countryCode = process.env.ADMIN_BOOTSTRAP_PHONE_COUNTRY_CODE || '+86';
  const phoneNumber = process.env.ADMIN_BOOTSTRAP_PHONE_NUMBER;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  const displayName = process.env.ADMIN_BOOTSTRAP_DISPLAY_NAME || 'Super Admin';
  const role = (process.env.ADMIN_BOOTSTRAP_ROLE || 'OWNER') as any;

  if (!phoneNumber || !password) {
    console.error(
      'Error: ADMIN_BOOTSTRAP_PHONE_NUMBER and ADMIN_BOOTSTRAP_PASSWORD are required.',
    );
    console.error(
      'Usage: ADMIN_BOOTSTRAP_PHONE_NUMBER=13800000000 ADMIN_BOOTSTRAP_PASSWORD=... npm run admin:create',
    );
    process.exit(1);
  }

  if (password.length < 12) {
    console.error('Error: Password must be at least 12 characters.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.adminAccount.findFirst({
    where: { phoneCountryCode: countryCode, phoneNumber },
  });

  if (existing) {
    await prisma.adminAccount.update({
      where: { id: existing.id },
      data: { passwordHash, role, displayName, status: 'ACTIVE' },
    });
    console.log(`AdminAccount updated: ${countryCode} ${phoneNumber} (role: ${role})`);
  } else {
    await prisma.adminAccount.create({
      data: { phoneCountryCode: countryCode, phoneNumber, passwordHash, role, displayName },
    });
    console.log(`AdminAccount created: ${countryCode} ${phoneNumber} (role: ${role})`);
  }
}

main()
  .catch((e) => {
    console.error('Failed to create admin:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
