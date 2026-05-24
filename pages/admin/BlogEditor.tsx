import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin';
import { summarizeBlogExcerpt } from '../../services/geminiSummarize';
import {
  ArrowLeft, Bold, Italic, Heading1, Heading2, Quote, Image as ImageIcon,
  Save, Eye, EyeOff, Upload, X, Type, Loader2, Link2, Sparkles
} from 'lucide-react';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const BlogEditor: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [author, setAuthor] = useState('MİMCE');
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [coverAlt, setCoverAlt] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [bubblePos, setBubblePos] = useState<{ top: number; left: number } | null>(null);
  const [inlineImgFile, setInlineImgFile] = useState<File | null>(null);
  const [inlineImgPreview, setInlineImgPreview] = useState('');
  const [inlineImgAlt, setInlineImgAlt] = useState('');
  const [inlineImgUploading, setInlineImgUploading] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [summaryNotice, setSummaryNotice] = useState<string | null>(null);

  const coverFileRef = useRef<HTMLInputElement>(null);
  const inlineImgFileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
        horizontalRule: {},
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'blog-editor-link' },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') return 'Başlık yaz...';
          return "Hikayeni anlat... (seç ve biçimlendir)";
        },
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px]',
      },
    },
    onSelectionUpdate: ({ editor: ed }) => {
      const { from, to } = ed.state.selection;
      if (from === to) { setBubblePos(null); return; }
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) { setBubblePos(null); return; }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width === 0) { setBubblePos(null); return; }
      setBubblePos({
        top: rect.top + window.scrollY - 52,
        left: rect.left + rect.width / 2,
      });
    },
  });

  useEffect(() => {
    if (!isEdit || !editor) return;
    (async () => {
      const { data } = await supabase.from('blogs').select('*').eq('id', id).single();
      if (data) {
        setTitle(data.title);
        setSlug(data.slug);
        setSlugManual(true);
        setExcerpt(data.excerpt ?? '');
        setAuthor(data.author ?? 'MİMCE');
        setTags((data.tags ?? []).join(', '));
        setPublished(data.published);
        setCoverImage(data.cover_image ?? '');
        setCoverAlt(data.cover_alt ?? '');
        setCoverPreview(data.cover_image ?? '');
        try {
          editor.commands.setContent(JSON.parse(data.content));
        } catch {
          editor.commands.setContent(data.content);
        }
      }
      setLoading(false);
    })();
  }, [isEdit, id, editor]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (!slugManual) setSlug(slugify(e.target.value));
  };

  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadCover = async (): Promise<string> => {
    if (!coverFile) return coverImage;
    const ext = coverFile.name.split('.').pop();
    const path = `blogs/covers/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('images').upload(path, coverFile);
    if (error) throw error;
    const { data } = supabase.storage.from('images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleInlineFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInlineImgFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setInlineImgPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const insertInlineImage = async () => {
    if (!editor) return;
    setInlineImgUploading(true);
    try {
      let src = inlineImgPreview;
      if (inlineImgFile) {
        const ext = inlineImgFile.name.split('.').pop();
        const path = `blogs/inline/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('images').upload(path, inlineImgFile);
        if (error) throw error;
        const { data } = supabase.storage.from('images').getPublicUrl(path);
        src = data.publicUrl;
      }
      editor.chain().focus().setImage({ src, alt: inlineImgAlt, title: inlineImgAlt }).run();
      setImageModalOpen(false);
      setInlineImgFile(null);
      setInlineImgPreview('');
      setInlineImgAlt('');
    } catch (err) {
      alert('Görsel yüklenemedi.');
    } finally {
      setInlineImgUploading(false);
    }
  };

  const insertDivider = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().setHorizontalRule().run();
  }, [editor]);

  const openLinkModal = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    setLinkUrl(prev ?? 'https://');
    setLinkModalOpen(true);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
    setLinkModalOpen(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setLinkModalOpen(false);
    setLinkUrl('');
  }, [editor]);

  const editorState = useEditorState({
    editor,
    selector: ctx => ({
      isBold: ctx.editor?.isActive('bold') ?? false,
      isItalic: ctx.editor?.isActive('italic') ?? false,
      isLink: ctx.editor?.isActive('link') ?? false,
      isH1: ctx.editor?.isActive('heading', { level: 1 }) ?? false,
      isH2: ctx.editor?.isActive('heading', { level: 2 }) ?? false,
      isBlockquote: ctx.editor?.isActive('blockquote') ?? false,
      isParagraph: ctx.editor?.isActive('paragraph') ?? false,
    }),
  });

  const handleAiSummarize = async () => {
    if (!editor) return;
    const body = editor.getText().trim();
    if (!title.trim() && !body) {
      alert('Önce başlık veya içerik yazın.');
      return;
    }
    setSummarizing(true);
    setSummaryNotice(null);
    try {
      const { text, notice } = await summarizeBlogExcerpt({ title, body });
      setExcerpt(text);
      if (notice) {
        setSummaryNotice(notice);
        setTimeout(() => setSummaryNotice(null), 5000);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Özet oluşturulamadı.';
      alert(msg);
    } finally {
      setSummarizing(false);
    }
  };

  const handleSave = async () => {
    if (!editor || !title.trim()) return alert('Başlık zorunlu.');
    setSaving(true);
    try {
      const finalCover = await uploadCover();
      const payload = {
        title: title.trim(),
        slug: slug || slugify(title),
        cover_image: finalCover || null,
        cover_alt: coverAlt || null,
        excerpt: excerpt || null,
        author: author || 'MİMCE',
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        content: JSON.stringify(editor.getJSON()),
        published,
        updated_at: new Date().toISOString(),
      };

      if (isEdit) {
        await supabase.from('blogs').update(payload).eq('id', id);
      } else {
        await supabase.from('blogs').insert({ ...payload, created_at: new Date().toISOString() });
      }
      navigate('/admin/bloglar');
    } catch (err) {
      alert('Kayıt hatası.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        {/* Row 1: nav + actions */}
        <div className="px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/bloglar')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Bloglar</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPublished(p => !p)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                published
                  ? 'bg-green-50 text-green-700 border-green-300'
                  : 'bg-gray-100 text-gray-500 border-gray-300'
              }`}
            >
              {published ? <Eye size={14} /> : <EyeOff size={14} />}
              {published ? 'Yayında' : 'Taslak'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-1.5 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>

        {/* Row 2: Format Toolbar */}
        <div className="px-6 pb-2 flex items-center gap-1 flex-wrap border-t border-gray-100">
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editorState?.isBold}
            title="Kalın"
          >
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editorState?.isItalic}
            title="İtalik"
          >
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={openLinkModal}
            active={editorState?.isLink}
            title="Bağlantı"
          >
            <Link2 size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editorState?.isH1}
            title="Başlık 1"
          >
            <Heading1 size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editorState?.isH2}
            title="Başlık 2"
          >
            <Heading2 size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            active={editorState?.isBlockquote}
            title="Alıntı"
          >
            <Quote size={16} />
          </ToolbarButton>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <ToolbarButton onClick={() => setImageModalOpen(true)} title="Görsel ekle">
            <ImageIcon size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={insertDivider} title="Ayraç (···) ekle">
            <span className="text-base font-bold tracking-[0.35em] leading-none px-0.5">···</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().setParagraph().run()}
            active={editorState?.isParagraph}
            title="Paragraf"
          >
            <Type size={16} />
          </ToolbarButton>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Cover Image */}
        <div className="mb-8">
          {coverPreview ? (
            <div className="relative group rounded-2xl overflow-hidden">
              <img src={coverPreview} alt={coverAlt} className="w-full h-64 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={() => coverFileRef.current?.click()}
                  className="px-4 py-2 bg-white text-gray-800 rounded-lg text-sm font-medium"
                >
                  Değiştir
                </button>
                <button
                  onClick={() => { setCoverPreview(''); setCoverFile(null); setCoverImage(''); }}
                  className="p-2 bg-white text-red-600 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => coverFileRef.current?.click()}
              className="w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary transition-all"
            >
              <Upload size={28} />
              <span className="text-sm font-medium">Kapak görseli ekle</span>
            </button>
          )}
          <input ref={coverFileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFileSelect} />
          {coverPreview && (
            <input
              type="text"
              placeholder="Kapak görseli açıklaması (alt text)"
              value={coverAlt}
              onChange={e => setCoverAlt(e.target.value)}
              className="mt-2 w-full text-sm text-gray-500 border-0 border-b border-gray-200 focus:outline-none focus:border-primary py-1 bg-transparent"
            />
          )}
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="Başlık..."
          value={title}
          onChange={handleTitleChange}
          className="w-full text-4xl font-bold text-gray-900 border-0 focus:outline-none bg-transparent placeholder:text-gray-300 mb-2"
        />

        {/* Slug */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-gray-400">URL:</span>
          <input
            type="text"
            value={slug}
            onChange={e => { setSlug(e.target.value); setSlugManual(true); }}
            className="text-xs text-gray-400 border-0 focus:outline-none bg-transparent flex-1 font-mono"
            placeholder="url-slug"
          />
        </div>

        {/* Floating Bubble Menu (seçim üzerinde) */}
        {editor && bubblePos && (
          <div
            style={{ position: 'fixed', top: bubblePos.top, left: bubblePos.left, transform: 'translateX(-50%)', zIndex: 9999 }}
            className="flex items-center gap-1 bg-gray-900 rounded-lg px-2 py-1 shadow-xl"
            onMouseDown={e => e.preventDefault()}
          >
            <BubbleButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editorState?.isBold}
            >
              <Bold size={14} />
            </BubbleButton>
            <BubbleButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editorState?.isItalic}
            >
              <Italic size={14} />
            </BubbleButton>
            <BubbleButton
              onClick={openLinkModal}
              active={editorState?.isLink}
            >
              <Link2 size={14} />
            </BubbleButton>
            <BubbleButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editorState?.isH1}
            >
              <Heading1 size={14} />
            </BubbleButton>
            <BubbleButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editorState?.isH2}
            >
              <Heading2 size={14} />
            </BubbleButton>
            <BubbleButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editorState?.isBlockquote}
            >
              <Quote size={14} />
            </BubbleButton>
          </div>
        )}

        {/* Editor */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm blog-editor">
          <EditorContent editor={editor} />
        </div>

        {/* Meta */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-700 text-sm">Meta Bilgileri</h3>
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="text-xs text-gray-500 font-medium">Özet (excerpt)</label>
              <button
                type="button"
                onClick={handleAiSummarize}
                disabled={summarizing}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 disabled:opacity-50 transition-colors"
              >
                {summarizing ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Sparkles size={13} />
                )}
                {summarizing ? 'Özetleniyor...' : 'AI ile özetle'}
              </button>
            </div>
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              rows={2}
              placeholder="Kısa açıklama..."
              className="mt-1 w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-primary resize-none"
            />
            {summaryNotice && (
              <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                {summaryNotice}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 font-medium">Yazar</label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="mt-1 w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Etiketler (virgülle)</label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="mühendislik, eğitim"
                className="mt-1 w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Link Modal */}
      {linkModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setLinkModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Bağlantı Ekle</h3>
              <button type="button" onClick={() => setLinkModalOpen(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <input
              type="url"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyLink()}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              {editorState?.isLink && (
                <button
                  type="button"
                  onClick={removeLink}
                  className="flex-1 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
                >
                  Kaldır
                </button>
              )}
              <button
                type="button"
                onClick={applyLink}
                className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-medium"
              >
                Uygula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Image Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Görsel Ekle</h3>
              <button onClick={() => { setImageModalOpen(false); setInlineImgFile(null); setInlineImgPreview(''); setInlineImgAlt(''); }}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div
              onClick={() => inlineImgFileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors mb-4"
            >
              {inlineImgPreview ? (
                <img src={inlineImgPreview} alt="" className="max-h-48 rounded-lg object-contain" />
              ) : (
                <>
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Görsel seçmek için tıkla</span>
                </>
              )}
            </div>
            <input ref={inlineImgFileRef} type="file" accept="image/*" className="hidden" onChange={handleInlineFileSelect} />

            <input
              type="text"
              placeholder="Alt metin (açıklama)"
              value={inlineImgAlt}
              onChange={e => setInlineImgAlt(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-primary mb-4"
            />

            <button
              onClick={insertInlineImage}
              disabled={!inlineImgPreview || inlineImgUploading}
              className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {inlineImgUploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
              {inlineImgUploading ? 'Yükleniyor...' : 'Ekle'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .blog-editor .ProseMirror h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 1.5rem 0 0.75rem;
          color: #111;
          line-height: 1.2;
        }
        .blog-editor .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.25rem 0 0.5rem;
          color: #222;
        }
        .blog-editor .ProseMirror p {
          margin: 0.75rem 0;
          line-height: 1.8;
          color: #374151;
          font-size: 1.05rem;
        }
        .blog-editor .ProseMirror blockquote {
          border-left: 4px solid #e5e7eb;
          padding: 0.5rem 1.25rem;
          margin: 1.5rem 0;
          color: #6b7280;
          font-style: italic;
          font-size: 1.1rem;
          background: #f9fafb;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        .blog-editor .ProseMirror hr {
          border: none;
          height: 0;
          margin: 2.5rem 0;
          padding: 0;
          background: none;
          overflow: visible;
        }
        .blog-editor .ProseMirror hr::before {
          content: '· · ·';
          display: block;
          text-align: center;
          font-size: 1.75rem;
          letter-spacing: 0.55em;
          color: #9ca3af;
          line-height: 1;
        }
        .blog-editor .ProseMirror em {
          font-style: italic;
        }
        .blog-editor .ProseMirror a.blog-editor-link {
          color: #0d9488;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .blog-editor .ProseMirror img {
          max-width: 100%;
          border-radius: 0.75rem;
          margin: 1.5rem auto;
          display: block;
        }
        .blog-editor .ProseMirror strong {
          font-weight: 700;
          color: #111;
        }
        .blog-editor .ProseMirror p.is-editor-empty:first-child::before {
          color: #d1d5db;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

const ToolbarButton: React.FC<{
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}> = ({ onClick, active, title, children }) => (
  <button
    onMouseDown={e => { e.preventDefault(); onClick(); }}
    title={title}
    className={`p-2 rounded-lg transition-all ${
      active ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {children}
  </button>
);

const BubbleButton: React.FC<{
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}> = ({ onClick, active, children }) => (
  <button
    onMouseDown={e => { e.preventDefault(); onClick(); }}
    className={`p-1.5 rounded transition-all ${
      active ? 'bg-white text-gray-900' : 'text-gray-300 hover:text-white'
    }`}
  >
    {children}
  </button>
);

export default BlogEditor;
