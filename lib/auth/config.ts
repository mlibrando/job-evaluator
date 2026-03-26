import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { getUserByEmail, createUser } from '@/lib/aws/dynamodb';

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }

      // Check if user exists, if not create them
      let existingUser = await getUserByEmail(user.email);

      if (!existingUser) {
        const now = new Date().toISOString();
        existingUser = await createUser({
          userId: crypto.randomUUID(),
          email: user.email,
          name: user.name || undefined,
          createdAt: now,
          updatedAt: now,
        });
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Fetch user from database to get our internal ID
        const dbUser = await getUserByEmail(user.email!);
        if (dbUser) {
          token.id = dbUser.userId;
          token.email = dbUser.email;
          token.name = dbUser.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
