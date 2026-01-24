import { Training, Event, Certificate, Activity, KPIData } from '../types';

// Mock Data
export const initialTrainings: Training[] = [
  {
    id: '1',
    title: 'İleri Seviye Yapısal Analiz',
    description: 'Deprem yönetmeliğine uygun yapısal analiz tekniklerini öğrenin.',
    date: '15 Ekim 2023',
    type: 'Profesyoneller',
    image: 'https://picsum.photos/400/250?random=1'
  },
  {
    id: '2',
    title: 'Python ile Veri Analizi',
    description: 'Mühendisler için Python kütüphaneleri ve veri görselleştirme.',
    date: '20 Ekim 2023',
    type: 'Öğrenciler',
    image: 'https://picsum.photos/400/250?random=2'
  },
  {
    id: '3',
    title: 'IoT Sistemleri Atölyesi',
    description: 'Nesnelerin interneti ve sensör uygulamaları üzerine pratik eğitim.',
    date: '25 Ekim 2023',
    type: 'Atölyeler',
    image: 'https://picsum.photos/400/250?random=3'
  },
  {
    id: '4',
    title: 'Yenilenebilir Enerji Trendleri',
    description: 'Güneş ve rüzgar enerjisi sektöründeki son gelişmeler.',
    date: '1 Kasım 2023',
    type: 'Webinarlar',
    image: 'https://picsum.photos/400/250?random=4'
  }
];

export const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Mühendislik Zirvesi 2023',
    date: '2023-11-15',
    time: '09:00',
    location: 'Grand Pera Hotel, İstanbul',
    description: 'Sektör liderlerinin buluştuğu yıllık zirve.',
    status: 'Yayında',
    image: 'https://picsum.photos/400/250?random=10'
  },
  {
    id: '2',
    title: 'Kariyer Günleri',
    date: '2023-12-05',
    time: '13:00',
    location: 'İTÜ Maslak Kampüsü',
    description: 'Öğrenciler ve şirketlerin buluşma noktası.',
    status: 'Yayında',
    image: 'https://picsum.photos/400/250?random=11'
  },
  {
    id: '3',
    title: 'Networking Gecesi',
    date: '2023-10-30',
    time: '19:00',
    location: 'Kolektif House Levent',
    description: 'Mühendisler arası iletişim ağı geliştirme etkinliği.',
    status: 'Taslak',
    image: 'https://picsum.photos/400/250?random=12'
  }
];

export const initialCertificates: Certificate[] = [
  { id: '1', certificateNo: 'MIMCE-2025-X9Y', recipientName: 'Ahmet Yılmaz', courseName: 'Yapısal Analiz', issueDate: '2023-09-15', status: 'Doğrulandı' },
  { id: '2', certificateNo: 'MIMCE-2025-A2B', recipientName: 'Ayşe Demir', courseName: 'Python Giriş', issueDate: '2023-09-20', status: 'Doğrulandı' },
  { id: '3', certificateNo: 'MIMCE-2025-C3D', recipientName: 'Mehmet Kaya', courseName: 'IoT Atölyesi', issueDate: '2023-10-01', status: 'Beklemede' },
  { id: '4', certificateNo: 'MIMCE-2025-E5F', recipientName: 'Zeynep Çelik', courseName: 'Proje Yönetimi', issueDate: '2023-10-05', status: 'Doğrulandı' },
  { id: '5', certificateNo: 'MIMCE-2025-G7H', recipientName: 'Can Yıldız', courseName: 'İş Güvenliği', issueDate: '2023-10-10', status: 'Beklemede' },
];

export const kpiData: KPIData[] = [
  { label: 'Toplam Üye', value: '2,543', icon: 'users', change: '+12%' },
  { label: 'Aktif Eğitim', value: '14', icon: 'book', change: '+2' },
  { label: 'Yaklaşan Etkinlik', value: '5', icon: 'calendar' },
  { label: 'Verilen Sertifika', value: '892', icon: 'award', change: '+54' },
];

export const recentActivities: Activity[] = [
  { id: '1', action: 'Yeni üye kaydı: Burak S.', timestamp: '2 saat önce', type: 'info' },
  { id: '2', action: 'Eğitim tamamlandı: Yapısal Analiz', timestamp: '5 saat önce', type: 'success' },
  { id: '3', action: 'Etkinlik oluşturuldu: Kariyer Günleri', timestamp: '1 gün önce', type: 'info' },
  { id: '4', action: 'Sertifika doğrulama hatası (ID: 999)', timestamp: '2 gün önce', type: 'warning' },
];

// In-memory store logic (Simple CRUD simulation)
let certificatesStore = [...initialCertificates];
let eventsStore = [...initialEvents];

export const getCertificates = () => certificatesStore;
export const getEvents = () => eventsStore;
export const addEvent = (event: Event) => {
  eventsStore = [event, ...eventsStore];
  return event;
};
export const deleteEvent = (id: string) => {
  eventsStore = eventsStore.filter(e => e.id !== id);
};

export const verifyCertificateNo = (certNo: string): Certificate | undefined => {
  return certificatesStore.find(c => c.certificateNo.toUpperCase() === certNo.toUpperCase());
};