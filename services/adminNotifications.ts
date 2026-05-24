import { supabaseAdmin as supabase } from './supabaseAdmin';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  created_by?: string;
}

export interface NotificationFilters {
  type?: AdminNotification['type'] | 'all';
  isRead?: boolean | 'all';
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest';
}

export interface NotificationStats {
  total: number;
  unread: number;
  info: number;
  success: number;
  warning: number;
  error: number;
}

export interface PaginatedNotifications {
  data: AdminNotification[];
  total: number;
  page: number;
  totalPages: number;
}

export const notificationService = {
  async getAll(): Promise<AdminNotification[]> {
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  },

  async getPaginated(filters: NotificationFilters = {}): Promise<PaginatedNotifications> {
    const {
      type = 'all',
      isRead = 'all',
      search = '',
      page = 1,
      limit = 20,
      sort = 'newest',
    } = filters;

    let query = supabase.from('admin_notifications').select('*', { count: 'exact' });

    if (type && type !== 'all') query = query.eq('type', type);
    if (isRead !== 'all') query = query.eq('is_read', isRead);
    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%`);
    }

    query = query
      .order('created_at', { ascending: sort === 'oldest' })
      .range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    const total = count ?? 0;
    return {
      data: data || [],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getStats(): Promise<NotificationStats> {
    const { data, error } = await supabase.from('admin_notifications').select('type, is_read');
    if (error) throw error;
    const rows = data || [];
    return {
      total: rows.length,
      unread: rows.filter((r) => !r.is_read).length,
      info: rows.filter((r) => r.type === 'info').length,
      success: rows.filter((r) => r.type === 'success').length,
      warning: rows.filter((r) => r.type === 'warning').length,
      error: rows.filter((r) => r.type === 'error').length,
    };
  },

  async create(notification: Pick<AdminNotification, 'title' | 'message' | 'type'>): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from('admin_notifications').insert({
      ...notification,
      created_by: user?.email,
    });
    if (error) throw error;
  },

  async markRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw error;
  },

  async markManyRead(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .in('id', ids);
    if (error) throw error;
  },

  async markAllRead(): Promise<void> {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .eq('is_read', false);
    if (error) throw error;
  },

  async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase.from('admin_notifications').delete().eq('id', id);
    if (error) throw error;
  },

  async deleteMany(ids: string[]): Promise<void> {
    const { error } = await supabase.from('admin_notifications').delete().in('id', ids);
    if (error) throw error;
  },

  async deleteAllRead(): Promise<void> {
    const { error } = await supabase.from('admin_notifications').delete().eq('is_read', true);
    if (error) throw error;
  },

  subscribe(callback: () => void): RealtimeChannel {
    return supabase
      .channel('admin_notifications_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_notifications',
        },
        callback
      )
      .subscribe();
  },
};
