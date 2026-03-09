import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Certificate } from '../../types';
import { Search, MoreVertical, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

const Certificates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<Certificate[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCertificateId, setEditingCertificateId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      const { data: certs } = await supabase
        .from('certificates')
        .select('*')
        .order('issueDate', { ascending: false });
      if (certs) setData(certs);
    };
    fetchCertificates();
  }, []);
  
  const filtered = data.filter(c => 
    c.certificateNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Form State
  const [formData, setFormData] = useState({
    certificateNo: '',
    recipientName: '',
    courseName: '',
    issueDate: '',
    status: 'Beklemede' as Certificate['status']
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      certificateNo: '',
      recipientName: '',
      courseName: '',
      issueDate: '',
      status: 'Beklemede'
    });
    setEditingCertificateId(null);
  };

  const handleEdit = (cert: Certificate) => {
    setFormData({
      certificateNo: cert.certificateNo,
      recipientName: cert.recipientName,
      courseName: cert.courseName,
      issueDate: cert.issueDate,
      status: cert.status
    });
    setEditingCertificateId(cert.id);
    setIsSheetOpen(true);
  };

  const handleDelete = async (certId: string, certNo: string) => {
    if (!window.confirm(`"${certNo}" sertifikasını silmek istediğinize emin misiniz?`)) {
      return;
    }

    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', certId);

    if (!error) {
      setData(data.filter(c => c.id !== certId));
    } else {
      alert('Sertifika silinirken bir hata oluştu: ' + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    if (!formData.certificateNo || !formData.recipientName || !formData.courseName || !formData.issueDate) {
      alert("Tüm alanlar zorunludur.");
      return;
    }

    if (editingCertificateId) {
      // Güncelleme
      const updatedCertificate: Partial<Certificate> = {
        certificateNo: formData.certificateNo.toUpperCase(),
        recipientName: formData.recipientName,
        courseName: formData.courseName,
        issueDate: formData.issueDate,
        status: formData.status
      };

      const { error } = await supabase
        .from('certificates')
        .update(updatedCertificate)
        .eq('id', editingCertificateId);

      if (!error) {
        setData(data.map(c => 
          c.id === editingCertificateId 
            ? { ...c, ...updatedCertificate } as Certificate
            : c
        ));
        setIsSheetOpen(false);
        resetForm();
      } else {
        alert('Sertifika güncellenirken bir hata oluştu: ' + error.message);
      }
    } else {
      // Yeni ekleme
      const newCertificate: Certificate = {
        id: Date.now().toString(),
        certificateNo: formData.certificateNo.toUpperCase(),
        recipientName: formData.recipientName,
        courseName: formData.courseName,
        issueDate: formData.issueDate,
        status: formData.status
      };

      const { error } = await supabase.from('certificates').insert([newCertificate]);
      if (!error) {
        setData([newCertificate, ...data]);
        setIsSheetOpen(false);
        resetForm();
      } else {
        alert('Sertifika eklenirken bir hata oluştu: ' + error.message);
      }
    }
  };

  return (
    <div className="relative h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sertifikaları Yönet</h1>
          <p className="text-sm text-gray-500 mt-1">Sertifikaları görüntüleyin, oluşturun ve yönetin.</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setIsSheetOpen(true);
          }}
          className="bg-primary text-navy font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus size={18} />
          Yeni Sertifika
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </span>
            <input 
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Sertifika No veya Katılımcı adı ara..."
            />
          </div>
          <div className="flex gap-2">
             {['Tümü', 'Yapısal', 'Elektrik', 'Yazılım', 'Güvenlik'].map(cat => (
               <button key={cat} className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50">
                 {cat}
               </button>
             ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sertifika No</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Alıcı Adı</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Eğitim/Etkinlik</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Veriliş Tarihi</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">{cert.certificateNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{cert.recipientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cert.courseName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cert.issueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      cert.status === 'Doğrulandı' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {cert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(cert)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      >
                        Düzenle
                      </button>
                      <button 
                        onClick={() => handleDelete(cert.id, cert.certificateNo)}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                   <td colSpan={6} className="px-6 py-10 text-center text-gray-500">Sonuç bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Toplam <span className="font-medium">{filtered.length}</span> sonuç gösteriliyor
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <ChevronLeft size={16} />
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">1</button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">2</button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">3</button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <ChevronRight size={16} />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Side Sheet Overlay */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-navy/30 backdrop-blur-sm" onClick={() => {
            setIsSheetOpen(false);
            resetForm();
          }}></div>
          
          {/* Sheet */}
          <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-slide-in">
             <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-navy">
                  {editingCertificateId ? 'Sertifikayı Düzenle' : 'Yeni Sertifika'}
                </h2>
                <button onClick={() => {
                  setIsSheetOpen(false);
                  resetForm();
                }} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
             </div>
             
             <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Sertifika Numarası*</label>
                  <input 
                    name="certificateNo"
                    value={formData.certificateNo}
                    onChange={handleInputChange}
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none uppercase"
                    placeholder="Örn: MIMCE-2025-X9Y"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Alıcı Adı*</label>
                  <input 
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleInputChange}
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Örn: Ahmet Yılmaz"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Eğitim/Etkinlik Adı*</label>
                  <input 
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleInputChange}
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Örn: İleri Seviye Yapısal Analiz"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Veriliş Tarihi*</label>
                  <input 
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleInputChange}
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Örn: 15 Ekim 2025"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none bg-white"
                  >
                    <option value="Beklemede">Beklemede</option>
                    <option value="Doğrulandı">Doğrulandı</option>
                  </select>
                </div>
             </form>

             <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50">
                <button 
                  type="button"
                  onClick={() => {
                    setIsSheetOpen(false);
                    resetForm();
                  }}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-100"
                >
                  İptal
                </button>
                <button 
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 bg-primary text-navy rounded-lg font-bold hover:bg-primary-dark shadow-sm"
                >
                  {editingCertificateId ? 'Güncelle' : 'Sertifikayı Kaydet'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;