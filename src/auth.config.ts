import type { NextAuthConfig } from 'next-auth';
import { LOGIN_ROUTE, PUBLIC_ROUTES, AUTH_REDIRECT } from '@/lib/constants';

export const authConfig = {
  pages: {
    signIn: LOGIN_ROUTE,
    error: LOGIN_ROUTE,
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublic = PUBLIC_ROUTES.some((r) => nextUrl.pathname.startsWith(r));

      if (isPublic) {
        if (isLoggedIn) {
          return Response.redirect(new URL(AUTH_REDIRECT, nextUrl));
        }
        return true;
      }

      if (nextUrl.pathname === '/') {
        return Response.redirect(
          new URL(isLoggedIn ? AUTH_REDIRECT : LOGIN_ROUTE, nextUrl),
        );
      }

      return isLoggedIn;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'ADMIN' | 'VENDEDOR' | 'ALMACEN';
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
