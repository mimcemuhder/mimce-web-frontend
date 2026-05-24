// Supabase bağlantı testi ve admin oluşturma
import { supabase } from '../services/supabase';
import { createDefaultAdmin } from '../scripts/createAdmin';

export const testSupabaseConnection = async () => {
  try {
    // Basit bir test sorgusu
    const { data, error } = await supabase.from('certificates').select('count').limit(1);

    if (error) {
      console.error('Supabase bağlantı hatası:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Supabase bağlantısı başarılı!');
    return { success: true, data };
  } catch (err) {
    console.error('Supabase bağlantı hatası:', err);
    return { success: false, error: String(err) };
  }
};

// Default admin oluştur
export const setupAdmin = async () => {
  return await createDefaultAdmin();
};
