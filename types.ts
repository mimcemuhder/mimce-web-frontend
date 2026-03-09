export interface Training {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'Öğrenciler' | 'Profesyoneller' | 'Atölyeler' | 'Webinarlar';
  image: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: 'Yayında' | 'Taslak' | 'İptal';
  image: string;
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