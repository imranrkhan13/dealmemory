import NextAuth from 'next-auth/next';
import type { NextRequest } from 'next/server';
import type { NextAuthOptions } from 'next-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function buildAuthOptions(): Promise<NextAuthOptions> {
  const [{ default: CredentialsProvider }, { PrismaAdapter }, { prisma }, { default: bcrypt }] = await Promise.all([
    import('next-auth/providers/credentials'),
    import('@next-auth/prisma-adapter'),
    import('@/lib/db'),
    import('bcrypt'),
  ]);

  return {
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
          const user = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (!user) return null;
          const ok = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!ok) return null;
          return { id: user.id, email: user.email, name: user.name };
        },
      }),
    ],
    session: { strategy: 'jwt' },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          (token as any).id = (user as any).id;
          token.name = (user as any).name;
          token.email = (user as any).email;
        }
        return token as any;
      },
      async session({ session, token }) {
        if (session.user) {
          (session.user as any).id = (token as any).id as string;
          (session.user as any).name = token.name as string;
          (session.user as any).email = token.email as string;
        }
        return session;
      },
    },
    pages: { signIn: '/auth/signin' },
    secret: process.env.NEXTAUTH_SECRET ?? 'dev-secret',
  };
}

export async function GET(req: NextRequest, ctx: any) {
  const options = await buildAuthOptions();
  const handler = (NextAuth as any)(options);
  return handler(req, ctx);
}

export async function POST(req: NextRequest, ctx: any) {
  const options = await buildAuthOptions();
  const handler = (NextAuth as any)(options);
  return handler(req, ctx);
}
