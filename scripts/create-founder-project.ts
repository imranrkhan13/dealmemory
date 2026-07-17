import { prisma } from '../lib/db';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

async function main() {
  const email = 'tester@dealmemory.local';
  const name = 'Tester Founder';
  const password = 'testpass';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: { email, name, passwordHash },
  });

  const prefix = `pk_${randomUUID().replaceAll('-', '').slice(0, 10)}`;
  const rawKey = `${prefix}_${randomUUID().replaceAll('-', '')}`;
  const keyHash = await bcrypt.hash(rawKey, 10);

  const project = await prisma.project.create({
    data: {
      name: 'Test Project',
      slug: 'test-project',
      ownerId: user.id,
      apiKeys: { create: { keyPrefix: prefix, keyHash } },
    },
    include: { apiKeys: true },
  });

  console.log('User:', user.email);
  console.log('Project created (id):', project.id);
  console.log('Raw Key (show ONCE):', rawKey);

  const stored = await prisma.projectApiKey.findUnique({ where: { id: project.apiKeys[0].id } });
  const ok = await bcrypt.compare(rawKey, stored!.keyHash);
  console.log('Raw key matches stored hash?', ok);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
