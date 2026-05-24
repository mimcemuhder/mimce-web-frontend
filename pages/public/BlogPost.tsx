import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { generateHTML } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TiptapLink from '@tiptap/extension-link';
import { supabase } from '../../services/supabase';
import { Blog } from '../../types';
import { Calendar, User, ArrowLeft, Loader2 } from 'lucide-react';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();
      if (data) {
        setBlog(data);
        try {
          const json = JSON.parse(data.content);
          const rendered = generateHTML(json, [
            StarterKit.configure({ heading: { levels: [1, 2] }, link: false }),
            TiptapLink,
            Image,
          ]);
          setHtml(
            DOMPurify.sanitize(rendered, {
              ALLOWED_TAGS: [
                'p',
                'h1',
                'h2',
                'h3',
                'ul',
                'ol',
                'li',
                'strong',
                'em',
                'a',
                'img',
                'blockquote',
                'hr',
                'br',
                'code',
                'pre',
              ],
              ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel', 'class'],
            })
          );
        } catch {
          setHtml(DOMPurify.sanitize(data.content));
        }
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (!blog) {
    return (
      <>
        <Helmet>
          <title>Makale Bulunamadı | MİMCE</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="max-w-2xl mx-auto px-4 py-32 text-center text-gray-400">
          <p className="text-lg font-medium">Makale bulunamadı.</p>
          <Link to="/blog" className="mt-4 inline-flex items-center gap-2 text-primary text-sm">
            <ArrowLeft size={14} /> Blog'a dön
          </Link>
        </div>
      </>
    );
  }

  const canonicalUrl = `https://mimce.org/blog/${blog.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    author: blog.author ? { '@type': 'Person', name: blog.author } : undefined,
    datePublished: blog.created_at,
    dateModified: blog.updated_at ?? blog.created_at,
    image: blog.cover_image ?? undefined,
    description: blog.excerpt ?? undefined,
    url: canonicalUrl,
    publisher: {
      '@type': 'Organization',
      name: 'MİMCE',
      url: 'https://mimce.org',
    },
  };

  return (
    <>
      <Helmet>
        <title>{blog.title} | MİMCE Blog</title>
        <meta name="description" content={blog.excerpt ?? blog.title} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt ?? blog.title} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta
          property="og:image"
          content={blog.cover_image || 'https://mimce.org/og-default.png'}
        />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <article className="max-w-2xl mx-auto px-4 py-16">
        {/* Back */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors mb-10"
        >
          <ArrowLeft size={14} /> Blog
        </Link>

        {/* Tags */}
        {(blog.tags ?? []).length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {(blog.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">{blog.title}</h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {new Date(blog.created_at).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          {blog.author && (
            <span className="flex items-center gap-1.5">
              <User size={14} />
              {blog.author}
            </span>
          )}
        </div>

        {/* Cover */}
        {blog.cover_image && (
          <figure className="mb-10">
            <img
              src={blog.cover_image}
              alt={blog.cover_alt ?? blog.title}
              className="w-full rounded-2xl object-cover max-h-96"
            />
            {blog.cover_alt && (
              <figcaption className="text-center text-sm text-gray-400 mt-2 italic">
                {blog.cover_alt}
              </figcaption>
            )}
          </figure>
        )}

        {/* Content */}
        <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: html }} />

        <style>{`
        .blog-post-content h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 2rem 0 1rem;
          color: #111;
          line-height: 1.2;
        }
        .blog-post-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.75rem 0 0.75rem;
          color: #222;
        }
        .blog-post-content p {
          margin: 1rem 0;
          line-height: 1.85;
          color: #374151;
          font-size: 1.05rem;
        }
        .blog-post-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding: 0.75rem 1.5rem;
          margin: 2rem 0;
          color: #6b7280;
          font-style: italic;
          font-size: 1.15rem;
          background: #f9fafb;
          border-radius: 0 0.75rem 0.75rem 0;
        }
        .blog-post-content hr {
          border: none;
          height: 0;
          margin: 2.5rem 0;
          padding: 0;
          background: none;
          overflow: visible;
        }
        .blog-post-content hr::before {
          content: '· · ·';
          display: block;
          text-align: center;
          font-size: 1.75rem;
          letter-spacing: 0.55em;
          color: #9ca3af;
          line-height: 1;
        }
        .blog-post-content em {
          font-style: italic;
        }
        .blog-post-content a {
          color: #0d9488;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .blog-post-content img {
          max-width: 100%;
          border-radius: 0.75rem;
          margin: 2rem auto;
          display: block;
        }
        .blog-post-content strong {
          font-weight: 700;
          color: #111;
        }
        .blog-post-content ul, .blog-post-content ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
          color: #374151;
          line-height: 1.85;
        }
        .blog-post-content li {
          margin: 0.35rem 0;
        }
      `}</style>
      </article>
    </>
  );
};

export default BlogPost;
