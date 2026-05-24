// Default admin kullanıcısı oluşturma scripti
// Bu dosyayı bir kez çalıştırarak default admin kullanıcısını oluşturabilirsiniz
import { supabase } from './supabase';

export const createDefaultAdmin = async () => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'mimce@mimce.com',
      password: 'mimceadmintest123',
    });

    if (error) {
      console.error('Admin oluşturma hatası:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Default admin kullanıcısı oluşturuldu!');
    console.log('E-posta: mimce@mimce.com');
    console.log('Şifre: mimceadmintest123');

    return { success: true, data };
  } catch (err) {
    console.error('Admin oluşturma hatası:', err);
    return { success: false, error: String(err) };
  }
};

// Kullanım: Tarayıcı konsolunda veya bir test sayfasında
// import { createDefaultAdmin } from './services/createAdmin';
// createDefaultAdmin();
