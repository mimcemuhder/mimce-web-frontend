export interface Training {
  id: string;
  code: string;
  title: string;
  description: string;
  date: string;
  type: 'Öğrenciler' | 'Profesyoneller' | 'Atölyeler' | 'Webinarlar';
  image: string;
  status?: 'Aktif' | 'Tamamlandı';
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  images?: string[];
}

export interface Certificate {
  id: string;
  certificateNo: string;
  recipientName: string;
  courseName: string;
  issueDate: string;
  status: 'Doğrulandı' | 'Beklemede';
}

export interface KPIData {
  label: string;
  value: string | number;
  icon: string;
  change?: string;
}

export interface Activity {
  id: string;
  action: string;
  timestamp: string;
  type: 'success' | 'warning' | 'info';
}

export interface UserTraining {
  id: string;
  user_id: string;
  training_id: string;
  enrolled_at: string;
  completed: boolean;
  training?: Training;
}

export interface UserEvent {
  id: string;
  user_id: string;
  event_id: string;
  enrolled_at: string;
  attended: boolean;
  event?: Event;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  cover_image?: string;
  cover_alt?: string;
  excerpt?: string;
  content: string; // JSON string (Tiptap doc)
  author?: string;
  tags?: string[];
  published: boolean;
  created_at: string;
  updated_at?: string;
}
