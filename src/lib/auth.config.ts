import type { NextAuthConfig } from 'next-auth';

const isHttps = process.env.AUTH_URL?.startsWith('https://') === true;

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  // Do not force Secure cookies just because NODE_ENV is production — that
  // drops the session on http://localhost (`next start`) and non-HTTPS hosts.
  useSecureCookies: isHttps,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage =
        nextUrl.pathname.startsWith('/login') ||
        nextUrl.pathname.startsWith('/register') ||
        nextUrl.pathname.startsWith('/forgot-password');

      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl));
        return true;
      }

      if (!isLoggedIn) {
        let from = nextUrl.pathname;
        if (nextUrl.search) from += nextUrl.search;
        return Response.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as 'ADMIN' | 'STAFF';
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id ?? token.sub) as string;
        session.user.role = token.role as 'ADMIN' | 'STAFF';
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
