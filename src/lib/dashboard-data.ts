import { cache } from 'react';
import { RowDataPacket } from 'mysql2';
import pool from './db';

export type DashboardUser = {
  name: string;
  username: string;
  role: string;
  avatar?: string;
};

export const getDashboardUser = cache(async (userId: string): Promise<DashboardUser | null> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT name, username, role, avatar FROM users WHERE id = ? LIMIT 1',
    [userId]
  );

  const user = rows[0];
  if (!user) return null;

  return {
    name: user.name,
    username: user.username,
    role: user.role,
    avatar: user.avatar || undefined,
  };
});

export const getCompanyLogo = cache(async (): Promise<string | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT setting_value FROM app_settings WHERE setting_key = "company_logo" LIMIT 1'
  );

  return rows[0]?.setting_value || null;
});
