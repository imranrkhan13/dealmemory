import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

process.env.DATABASE_URL ??= 'file:./dev.db';

const prisma = new PrismaClient({});

async function main() {
  const password = 'demo1234';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@dealmemory.local' },
    update: {},
    create: {
      email: 'demo@dealmemory.local',
      name: 'Demo Founder',
      passwordHash,
      projects: {
        create: [
          {
            name: 'RepoMap demo',
            slug: 'repomap-demo',
            apiKeys: {
              create: [
                {
                  keyPrefix: 'pk_demo_repomap',
                  keyHash: await bcrypt.hash('pk_demo_repomap_unsafe', 10),
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('Seeded demo founder:', user.email);
  console.log('Demo login password:', password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
