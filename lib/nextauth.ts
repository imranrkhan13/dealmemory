import { authSecret } from './auth-secret';
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

        const existing = await prisma.user.findUnique({ where: { email: credentials.email.trim().toLowerCase() } });

        if (!existing || new TextEncoder().encode(credentials.password).length>72) return null;

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
        (session.user as any).id = (token.id as string) || (token.sub as string);
        (session.user as any).name = token.name as string;
        (session.user as any).email = token.email as string;
      }
      return session;
    },
  },
  pages: { signIn: '/auth/signin' },
  secret: authSecret(),
};