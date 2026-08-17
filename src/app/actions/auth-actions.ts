'use server';

import { auth, signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';
import pool from '@/lib/db';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['ADMIN', 'STAFF']).default('ADMIN'),
});

export async function loginAction(prevState: any, formData: FormData) {
  try {
    await signIn('credentials', {
      username: formData.get('username'),
      password: formData.get('password'),
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, message: 'Invalid username or password.' };
        default:
          return { success: false, message: 'Something went wrong.' };
      }
    }
    throw error; // This is necessary for Next.js redirects to work!
  }
}

export async function registerAction(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = registerSchema.safeParse(rawData);

    if (!validatedData.success) {
      return {
        success: false,
        message: 'Invalid form data.',
        errors: validatedData.error.flatten().fieldErrors,
      };
    }

    const { name, username, password, role } = validatedData.data;

    // Restrict registration to a single admin user
    const [totalUsers]: any = await pool.query('SELECT COUNT(*) as count FROM users');
    if (totalUsers[0].count > 0) {
      return { success: false, message: 'Registration is closed. An admin account already exists.' };
    }

    // Check if username already exists (just in case)
    const [existingUsers]: any = await pool.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      return { success: false, message: 'Username already taken.' };
    }

    // Generate user ID
    const userId = `usr_${Date.now().toString(36)}`;

    // In a production app, we would hash the password here using bcrypt!
    // For now we will insert it directly to match the existing login flow which uses plain text seed passwords.
    await pool.query(
      `
      INSERT INTO users (id, name, username, password, role)
      VALUES (?, ?, ?, ?, ?)
      `,
      [userId, name, username, password, role]
    );

    return { success: true, message: 'Registration successful! You can now login.' };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Failed to register. Please try again.' };
  }
}

export async function updateProfileAction(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, message: 'Unauthorized' };

    const name = formData.get('name') as string;
    const username = formData.get('username') as string;

    if (!name || !username) {
      return { success: false, message: 'Name and Username are required.' };
    }

    const [existingUsers]: any = await pool.query(
      'SELECT id FROM users WHERE username = ? AND id != ?',
      [username, session.user.id]
    );

    if (existingUsers.length > 0) {
      return { success: false, message: 'Username is already taken by another user.' };
    }

    await pool.query(
      'UPDATE users SET name = ?, username = ? WHERE id = ?',
      [name, username, session.user.id]
    );

    return { success: true, message: 'Profile updated successfully. Next time you login, changes will reflect.' };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, message: 'Failed to update profile.' };
  }
}

export async function updatePasswordAction(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, message: 'Unauthorized' };

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, message: 'All fields are required.' };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, message: 'New passwords do not match.' };
    }

    if (newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }

    const [users]: any = await pool.query('SELECT password FROM users WHERE id = ?', [session.user.id]);
    const user = users[0];

    if (!user || user.password !== currentPassword) {
      return { success: false, message: 'Incorrect current password.' };
    }

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, session.user.id]);

    return { success: true, message: 'Password updated successfully.' };
  } catch (error) {
    console.error('Update password error:', error);
    return { success: false, message: 'Failed to update password.' };
  }
}
