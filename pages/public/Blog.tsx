import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../services/supabase';
import { Blog } from '../../types';
import { Calendar, User, Tag, ArrowRight, FileText } from 'lucide-react';

const PublicBlog: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('blogs')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      if (data) setBlogs(data);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-2xl mb-4" />
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-32 text-center text-gray-400">
        <FileText size={48} className="mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">Henüz yayınlanmış blog yok.</p>
      </div>
    );
  }

  const [featured, ...rest] = blogs;

  return (
    <>
      <Helmet>
        <title>Blog | MİMCE</title>
        <meta
          name="description"
          content="Mühendislik, teknoloji ve kariyer üzerine MİMCE blog yazıları."
        />
        <link rel="canonical" href="https://mimce.org/blog" />
        <meta property="og:title" content="Blog | MİMCE" />
        <meta property="og:description" content="Mühendislik ve teknoloji üzerine yazılar." />
        <meta property="og:url" content="https://mimce.org/blog" />
        <meta property="og:image" content="https://mimce.org/og-default.png" />
      </Helmet>
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Blog</h1>
          <p className="text-gray-500">Mühendislik, teknoloji ve kariyer üzerine yazılar.</p>
        </div>

        {/* Featured */}
        <Link to={`/blog/${featured.slug}`} className="group block mb-14">
          <div className="relative overflow-hidden rounded-3xl">
            {featured.cover_image ? (
              <img
                src={featured.cover_image}
                alt={featured.cover_alt ?? featured.title}
                className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-72 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <FileText size={64} className="text-primary/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-center gap-2 mb-3">
                {(featured.tags ?? []).slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 bg-white/20 text-white rounded-full backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:underline underline-offset-4">
                {featured.title}
              </h2>
              {featured.excerpt && (
                <p className="text-white/80 text-sm line-clamp-2">{featured.excerpt}</p>
              )}
              <div className="flex items-center gap-3 mt-3 text-white/60 text-xs">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(featured.created_at).toLocaleDateString('tr-TR')}
                </span>
                {featured.author && (
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {featured.author}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Grid */}
        {rest.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((blog) => (
              <Link key={blog.id} to={`/blog/${blog.slug}`} className="group flex flex-col">
                <div className="overflow-hidden rounded-2xl mb-4">
                  {blog.cover_image ? (
                    <img
                      src={blog.cover_image}
                      alt={blog.cover_alt ?? blog.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                      <FileText size={40} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col">
                  {(blog.tags ?? []).length > 0 && (
                    <div className="flex items-center gap-1 mb-2 flex-wrap">
                      {(blog.tags ?? []).slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2 group-hover:text-primary transition-colors">
                    {blog.title}
                  </h3>
                  {blog.excerpt && (
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">{blog.excerpt}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(blog.created_at).toLocaleDateString('tr-TR')}
                    </span>
                    <span className="flex items-center gap-1 text-primary font-medium">
                      Oku <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PublicBlog;
