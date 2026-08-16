import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import pool from './db';
import { RowDataPacket } from 'mysql2';
import { authConfig } from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const [rows] = await pool.query<RowDataPacket[]>(
          'SELECT * FROM users WHERE username = ?',
          [credentials.username]
        );

        const user = rows[0];

        if (!user) return null;

        // In production, we should use bcrypt.compare. For this prototype, we're supporting plain text seed passwords.
        const isMatch = credentials.password === user.password;

        if (!isMatch) return null;

        return {
          id: user.id,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});
