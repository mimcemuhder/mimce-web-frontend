import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>404 - Sayfa Bulunamadı | MİMCE</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <div className="text-8xl font-extrabold text-primary/20 mb-4 select-none">404</div>
          <h1 className="text-2xl font-extrabold text-navy mb-3">Sayfa Bulunamadı</h1>
          <p className="text-gray-500 text-base leading-relaxed mb-8">
            Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={15} /> Geri Dön
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-lg text-sm font-bold hover:bg-navy-light transition-colors"
            >
              <Home size={15} /> Ana Sayfa
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
