'use server';

import { auth } from '@/lib/auth';
import pool from '@/lib/db';

export async function updateLogoAction(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { success: false, message: 'Unauthorized' };

    const logo = formData.get('logo') as string;

    if (logo) {
      // Check if setting exists
      const [rows]: any = await pool.query('SELECT setting_key FROM app_settings WHERE setting_key = "company_logo"');
      
      if (rows.length > 0) {
        await pool.query('UPDATE app_settings SET setting_value = ? WHERE setting_key = "company_logo"', [logo]);
      } else {
        await pool.query('INSERT INTO app_settings (setting_key, setting_value) VALUES ("company_logo", ?)', [logo]);
      }
    }

    return { success: true, message: 'Company logo updated successfully.' };
  } catch (error) {
    console.error('Update logo error:', error);
    return { success: false, message: 'Failed to update company logo.' };
  }
}
