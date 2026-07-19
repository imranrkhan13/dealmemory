import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const existing = await prisma.user.findUnique({ where: { email: credentials.email } });

        if (!existing) {
          const total = await prisma.user.count();
          if (total === 0) {
            const { hash } = await import('bcryptjs');
            const passwordHash = await hash(credentials.password, 10);
            const created = await prisma.user.create({
              data: {
                email: credentials.email,
                name: credentials.email.split('@')[0] || 'Founder',
                passwordHash,
              },
            });

            const baseName = created.name || created.email.split('@')[0] || 'My Project';
            const slugBase = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const slug = `${slugBase || 'project'}-${Math.random().toString(36).slice(2, 6)}`;

            const project = await prisma.project.create({
              data: { name: `${baseName}'s Project`, slug, ownerId: created.id },
            });

            const { generateProjectKey } = await import('@/lib/keys');
            const pub = await generateProjectKey('pk_live');
            const sec = await generateProjectKey('sk_live');

            await prisma.projectApiKey.createMany({
              data: [
                { projectId: project.id, keyPrefix: pub.prefix, keyHash: pub.keyHash },
                { projectId: project.id, keyPrefix: sec.prefix, keyHash: sec.keyHash },
              ],
            });

            return { id: created.id, email: created.email, name: created.name };
          }
          return null;
        }

        const { compare } = await import('bcryptjs');
        const ok = await compare(credentials.password, (existing as any).passwordHash);
        if (!ok) return null;
        return { id: (existing as any).id, email: (existing as any).email, name: (existing as any).name };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.name = (user as any).name;
        token.email = (user as any).email;
      }
      return token as any;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).name = token.name as string;
        (session.user as any).email = token.email as string;
      }
      return session;
    },
  },
  pages: { signIn: '/auth/signin' },
  secret: process.env.NEXTAUTH_SECRET ?? 'dev-secret',
};