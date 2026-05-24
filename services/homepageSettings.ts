import { supabase } from './supabase';
import { supabaseAdmin } from './supabaseAdmin';

export const HOMEPAGE_SETTING_KEYS = {
  heroImage: 'home_hero_image',
} as const;

export const DEFAULT_HERO_IMAGE = 'https://picsum.photos/1920/1080?grayscale&blur=2';

export type HomepageSettings = {
  heroImage: string;
};

const keys = Object.values(HOMEPAGE_SETTING_KEYS);

function mapRows(rows: { key: string; value: string }[] | null): HomepageSettings {
  const byKey = new Map((rows ?? []).map((r) => [r.key, r.value]));
  return {
    heroImage: byKey.get(HOMEPAGE_SETTING_KEYS.heroImage) || DEFAULT_HERO_IMAGE,
  };
}

export async function fetchHomepageSettings(): Promise<HomepageSettings> {
  const { data, error } = await supabase.from('site_settings').select('key, value').in('key', keys);

  if (error) {
    console.warn('Ana sayfa ayarları okunamadı:', error.message);
    return { heroImage: DEFAULT_HERO_IMAGE };
  }

  return mapRows(data);
}

export async function fetchHomepageSettingsAdmin(): Promise<HomepageSettings> {
  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .select('key, value')
    .in('key', keys);

  if (error) {
    console.warn('Ana sayfa ayarları okunamadı:', error.message);
    return { heroImage: DEFAULT_HERO_IMAGE };
  }

  return mapRows(data);
}

export async function saveHomepageHeroImage(url: string): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin.from('site_settings').upsert(
    {
      key: HOMEPAGE_SETTING_KEYS.heroImage,
      value: url,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  );

  if (error) return { error: error.message };
  return {};
}

export async function uploadHomepageImage(file: File): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const path = `homepage/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabaseAdmin.storage.from('images').upload(path, file);
  if (error) {
    console.error('Ana sayfa görseli yüklenemedi:', error.message);
    return null;
  }
  return supabaseAdmin.storage.from('images').getPublicUrl(path).data.publicUrl;
}
