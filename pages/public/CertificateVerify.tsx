import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../services/supabase';
import { Certificate } from '../../types';
import { CheckCircle, XCircle, Search } from 'lucide-react';

const CertificateVerify: React.FC = () => {
  const [certNo, setCertNo] = useState('');
  const [result, setResult] = useState<{ status: 'idle' | 'valid' | 'invalid', data?: Certificate }>({ status: 'idle' });

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNo.trim()) return;

    const { data } = await supabase
      .from('certificates')
      .select('*')
      .eq('certificateNo', certNo.toUpperCase())
      .single();

    if (data) {
      setResult({ status: 'valid', data });
    } else {
      setResult({ status: 'invalid' });
    }
  };

  return (
    <>
    <Helmet>
      <title>Sertifika Doğrulama | MİMCE</title>
      <meta name="description" content="MİMCE sertifikanızın geçerliliğini online olarak doğrulayın. Sertifika numaranızı girin." />
      <link rel="canonical" href="https://mimce.org/sertifika-dogrulama" />
      <meta property="og:title" content="Sertifika Doğrulama | MİMCE" />
      <meta property="og:description" content="MİMCE sertifikanızın geçerliliğini online olarak doğrulayın." />
      <meta property="og:url" content="https://mimce.org/sertifika-dogrulama" />
      <meta property="og:image" content="https://mimce.org/og-default.png" />
    </Helmet>
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Left Illustration */}
        <div className="md:w-5/12 bg-navy p-8 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-4">Sertifika<br/>Doğrulama</h2>
            <div className="w-16 h-1 bg-primary mb-6 mx-auto md:mx-0"></div>
            <p className="text-gray-300 leading-relaxed">
              MİMCE tarafından verilen sertifikaların orijinalliğini kontrol edin. Güvenilir ve şeffaf eğitim geçmişi.
            </p>
          </div>
        </div>

        {/* Right Form */}
        <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-navy mb-2">Sertifika Sorgulama</h1>
          <p className="text-gray-500 mb-8">Sertifika numaranızı girerek doğrulama yapın.</p>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sertifika Numarası</label>
              <div className="relative">
                 <input 
                   type="text" 
                   value={certNo}
                   onChange={(e) => setCertNo(e.target.value)}
                   className="block w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all uppercase"
                   placeholder="Örn: MIMCE-2025-X9Y"
                 />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full bg-primary text-navy font-bold py-3 rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
            >
              Doğrula
            </button>
          </form>

          {/* Result Area */}
          <div className="mt-8 min-h-[100px]">
            {result.status === 'valid' && result.data && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="text-green-600" size={24} />
                  <span className="text-green-800 font-bold text-lg">Sertifika doğrulandı</span>
                </div>
                <div className="mt-2 text-sm text-green-900 space-y-1">
                  <p><span className="font-semibold">Alıcı:</span> {result.data.recipientName}</p>
                  <p><span className="font-semibold">Eğitim:</span> {result.data.courseName}</p>
                  <p><span className="font-semibold">Tarih:</span> {result.data.issueDate}</p>
                </div>
              </div>
            )}

            {result.status === 'invalid' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
                 <XCircle className="text-red-600" size={24} />
                 <span className="text-red-800 font-bold">Sertifika bulunamadı</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
    </>
  );
};

export default CertificateVerify;