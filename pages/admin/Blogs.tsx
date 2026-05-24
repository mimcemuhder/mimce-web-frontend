import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin';
import { Blog } from '../../types';
import { Plus, Edit2, Trash2, Eye, EyeOff, Calendar, Search, Loader2, FileText } from 'lucide-react';

const Blogs: React.FC = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setBlogs(data);
    setLoading(false);
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleDelete = async (blog: Blog) => {
    if (!confirm(`"${blog.title}" silinsin mi?`)) return;
    setDeleting(blog.id);
    await supabase.from('blogs').delete().eq('id', blog.id);
    setBlogs(prev => prev.filter(b => b.id !== blog.id));
    setDeleting(null);
  };

  const togglePublish = async (blog: Blog) => {
    await supabase.from('blogs').update({ published: !blog.published }).eq('id', blog.id);
    setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, published: !b.published } : b));
  };

  const filtered = blogs.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    (b.author ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bloglar</h1>
          <p className="text-sm text-gray-500 mt-1">{blogs.length} makale</p>
        </div>
        <button
          onClick={() => navigate('/admin/bloglar/yeni')}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm"
        >
          <Plus size={18} />
          Yeni Blog
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Başlık veya yazar ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
          <FileText size={40} className="mb-3 opacity-40" />
          <p className="text-sm">Henüz blog yok</p>
          <button
            onClick={() => navigate('/admin/bloglar/yeni')}
            className="mt-4 px-4 py-2 text-sm bg-primary text-white rounded-lg"
          >
            İlk blogu yaz
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(blog => (
            <div
              key={blog.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              {/* Cover thumb */}
              {blog.cover_image ? (
                <img
                  src={blog.cover_image}
                  alt={blog.cover_alt ?? ''}
                  className="w-20 h-16 object-cover rounded-xl flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText size={24} className="text-gray-300" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold text-gray-900 truncate">{blog.title}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    blog.published
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {blog.published ? 'Yayında' : 'Taslak'}
                  </span>
                </div>
                {blog.excerpt && (
                  <p className="text-sm text-gray-500 truncate mb-1">{blog.excerpt}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(blog.created_at).toLocaleDateString('tr-TR')}
                  </span>
                  {blog.author && <span>· {blog.author}</span>}
                  {blog.tags && blog.tags.length > 0 && (
                    <span>· {blog.tags.join(', ')}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => togglePublish(blog)}
                  title={blog.published ? 'Taslağa al' : 'Yayınla'}
                  className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  {blog.published ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => navigate(`/admin/bloglar/${blog.id}`)}
                  title="Düzenle"
                  className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(blog)}
                  disabled={deleting === blog.id}
                  title="Sil"
                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                >
                  {deleting === blog.id
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Trash2 size={16} />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blogs;
