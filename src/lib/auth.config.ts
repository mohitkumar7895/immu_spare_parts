import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login', // Custom login page
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');

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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'ADMIN' | 'STAFF';
      }
      return session;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
