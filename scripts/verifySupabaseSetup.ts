/**
 * Yerel .env.local ile Supabase şema/storage kontrolü.
 * Çalıştır: npm run verify:supabase
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'node:path';

config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.VITE_SUPABASE_URL ?? '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? '';

function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const code = error.code ?? '';
  const msg = (error.message ?? '').toLowerCase();
  if (code === 'PGRST205' || code === '42P01') return true;
  if (msg.includes('schema cache') || msg.includes('does not exist')) return true;
  return false;
}

async function checkTable(
  label: string,
  fn: () => PromiseLike<{ error: { code?: string; message?: string } | null }>,
): Promise<'ok' | 'missing' | 'warn'> {
  const { error } = await Promise.resolve(fn());
  if (error && isMissingTable(error)) {
    console.log(`  [eksik] ${label}: tablo bulunamadı veya şemada yok`);
    return 'missing';
  }
  if (error) {
    console.log(`  [uyarı] ${label}: ${error.message}`);
    return 'warn';
  }
  console.log(`  [tamam] ${label}`);
  return 'ok';
}

async function main(): Promise<void> {
  console.log('Supabase kurulum doğrulaması\n');

  if (!url || !anonKey) {
    console.error('VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY .env.local içinde tanımlı olmalı.');
    process.exit(1);
  }

  const supabase = createClient(url, anonKey);

  let missing = 0;

  console.log('Tablolar (anon istemci):');
  const tables: [string, () => PromiseLike<{ error: { code?: string; message?: string } | null }>][] = [
    ['events', () => supabase.from('events').select('id').limit(1)],
    ['trainings', () => supabase.from('trainings').select('id').limit(1)],
    ['certificates', () => supabase.from('certificates').select('id').limit(1)],
    ['members', () => supabase.from('members').select('id').limit(1)],
    ['user_trainings', () => supabase.from('user_trainings').select('id').limit(1)],
    ['user_events', () => supabase.from('user_events').select('id').limit(1)],
  ];

  for (const [name, q] of tables) {
    const r = await checkTable(name, q);
    if (r === 'missing') missing += 1;
  }

  console.log('\nStorage bucket:');
  for (const bucket of ['avatars', 'images']) {
    const { data, error } = await supabase.storage.getBucket(bucket);
    if (error || !data) {
      console.log(`  [eksik] ${bucket}: ${error?.message ?? 'bucket yok'}`);
      missing += 1;
    } else {
      console.log(`  [tamam] ${bucket}`);
    }
  }

  console.log('');
  if (missing > 0) {
    console.log(`Özet: ${missing} eksik/uyumsuz öğe. SUPABASE_YAPILACAKLAR.md kontrol listesine bakın.`);
    process.exit(1);
  }
  console.log('Özet: temel tablolar ve bucket’lar erişilebilir görünüyor.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
