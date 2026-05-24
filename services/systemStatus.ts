import { supabaseAdmin as supabase } from './supabaseAdmin';

export interface ServiceStatus {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  latencyMs?: number;
}

export interface SystemStatus {
  services: ServiceStatus[];
  lastChecked: Date;
  overall: 'online' | 'degraded' | 'offline';
}

export async function checkSystemStatus(): Promise<SystemStatus> {
  const services: ServiceStatus[] = [];

  // Database
  const dbStart = Date.now();
  try {
    const { error } = await supabase.from('trainings').select('id', { count: 'exact', head: true });
    services.push({
      name: 'Veritabanı',
      status: error ? 'offline' : 'online',
      latencyMs: Date.now() - dbStart,
    });
  } catch {
    services.push({ name: 'Veritabanı', status: 'offline' });
  }

  // Auth
  const authStart = Date.now();
  try {
    const { error } = await supabase.auth.getSession();
    services.push({
      name: 'Kimlik Doğrulama',
      status: error ? 'offline' : 'online',
      latencyMs: Date.now() - authStart,
    });
  } catch {
    services.push({ name: 'Kimlik Doğrulama', status: 'offline' });
  }

  // Storage
  const storageStart = Date.now();
  try {
    const { error } = await supabase.storage.listBuckets();
    services.push({
      name: 'Depolama',
      status: error ? 'degraded' : 'online',
      latencyMs: Date.now() - storageStart,
    });
  } catch {
    services.push({ name: 'Depolama', status: 'offline' });
  }

  const anyOffline = services.some((s) => s.status === 'offline');
  const anyDegraded = services.some((s) => s.status === 'degraded');

  return {
    services,
    lastChecked: new Date(),
    overall: anyOffline ? 'offline' : anyDegraded ? 'degraded' : 'online',
  };
}
