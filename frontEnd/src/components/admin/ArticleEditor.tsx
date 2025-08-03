import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  Eye, 
  Image, 
  Tag, 
  Folder, 
  Search, 
  Filter,
  Upload,
  X,
  Calendar,
  User,
  BookOpen,
  FileText,
  File,
  Download,
  ExternalLink
} from 'lucide-react';
import type { Article } from '../../App';

interface ArticleEditorProps {
  articles: Article[];
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ articles: initialArticles }) => {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Biblical book categories
  const biblicalBooks = [
    'All', 'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians',
    '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
    'General', 'Devotional', 'Theology', 'Christian Living'
  ];

  const statuses = ['All', 'draft', 'published', 'archived'];

  const [editorForm, setEditorForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'General',
    tags: [] as string[],
    featuredImage: '',
    pdfFile: '',
    contentType: 'text' as 'text' | 'pdf',
    status: 'draft' as 'draft' | 'published' | 'archived'
  });

  const [newTag, setNewTag] = useState('');

  // Quill editor modules with enhanced toolbar
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'align', 'list', 'bullet',
    'blockquote', 'code-block', 'link', 'image',
    'indent'
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || article.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || article.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Generate SEO-friendly slug
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleCreateNew = () => {
    setEditingArticle(null);
    setEditorForm({
      title: '',
      content: '',
      excerpt: '',
      category: 'General',
      tags: [],
      featuredImage: '',
      pdfFile: '',
      contentType: 'text',
      status: 'draft'
    });
    setShowEditor(true);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setEditorForm({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category,
      tags: article.tags,
      featuredImage: article.featuredImage || '',
      pdfFile: article.pdfFile || '',
      contentType: article.contentType,
      status: article.status
    });
    setShowEditor(true);
  };

  const handleSave = () => {
    const now = new Date().toISOString().split('T')[0];
    const slug = generateSlug(editorForm.title);
    
    if (editingArticle) {
      // Update existing article
      setArticles(articles.map(article => 
        article.id === editingArticle.id 
          ? {
              ...article,
              ...editorForm,
              slug: generateSlug(editorForm.title),
              publishedDate: editorForm.status === 'published' && !article.publishedDate ? now : article.publishedDate
            }
          : article
      ));
    } else {
      // Create new article
      const newArticle: Article = {
        id: Date.now(),
        ...editorForm,
        slug,
        author: 'Current User', // This would come from auth context
        createdDate: now,
        publishedDate: editorForm.status === 'published' ? now : undefined,
        readTime: editorForm.contentType === 'pdf' ? 30 : Math.ceil(editorForm.content.replace(/<[^>]*>/g, '').split(' ').length / 200),
        views: 0
      };
      setArticles([newArticle, ...articles]);
    }
    
    setShowEditor(false);
    setEditingArticle(null);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this article?')) {
      setArticles(articles.filter(article => article.id !== id));
    }
  };

  const handleViewArticle = (article: Article) => {
    if (article.status === 'published') {
      navigate(`/article/${article.slug}`);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to a server and get back a URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditorForm({ ...editorForm, featuredImage: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePDFUpload = () => {
    pdfInputRef.current?.click();
  };

  const handlePDFChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      // In a real app, you'd upload to a server and get back a URL
      setEditorForm({ ...editorForm, pdfFile: file.name });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !editorForm.tags.includes(newTag.trim())) {
      setEditorForm({
        ...editorForm,
        tags: [...editorForm.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditorForm({
      ...editorForm,
      tags: editorForm.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const oldTestament = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings'];
    const newTestament = ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians'];
    
    if (oldTestament.includes(category)) return 'bg-blue-100 text-blue-800';
    if (newTestament.includes(category)) return 'bg-purple-100 text-purple-800';
    return 'bg-indigo-100 text-indigo-800';
  };

  if (showEditor) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Editor Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-blue-900">
                {editingArticle ? 'Edit Article' : 'Create New Article'}
              </h1>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEditor(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors duration-200 flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Article
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Article Title</label>
                <input
                  type="text"
                  value={editorForm.title}
                  onChange={(e) => setEditorForm({ ...editorForm, title: e.target.value })}
                  className="w-full px-4 py-3 text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter article title..."
                />
                {editorForm.title && (
                  <p className="text-sm text-gray-500 mt-2">
                    URL: /article/{generateSlug(editorForm.title)}
                  </p>
                )}
              </div>

              {/* Content Type Selection */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">Content Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="text"
                      checked={editorForm.contentType === 'text'}
                      onChange={(e) => setEditorForm({ ...editorForm, contentType: e.target.value as 'text' | 'pdf' })}
                      className="mr-2"
                    />
                    <span>Text Article</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="pdf"
                      checked={editorForm.contentType === 'pdf'}
                      onChange={(e) => setEditorForm({ ...editorForm, contentType: e.target.value as 'text' | 'pdf' })}
                      className="mr-2"
                    />
                    <span>PDF Document</span>
                  </label>
                </div>
              </div>

              {/* Content Editor or PDF Upload */}
              {editorForm.contentType === 'text' ? (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">Article Content</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <ReactQuill
                      value={editorForm.content}
                      onChange={(content) => setEditorForm({ ...editorForm, content })}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Write your article content here..."
                      style={{ minHeight: '400px' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">PDF Document</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {editorForm.pdfFile ? (
                      <div className="space-y-4">
                        <File className="h-16 w-16 text-blue-600 mx-auto" />
                        <div>
                          <p className="text-lg font-medium text-gray-800">{editorForm.pdfFile}</p>
                          <p className="text-sm text-gray-500">PDF document uploaded</p>
                        </div>
                        <button
                          onClick={handlePDFUpload}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                          Replace PDF
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-16 w-16 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium text-gray-800">Upload PDF Document</p>
                          <p className="text-sm text-gray-500">Click to select a PDF file to upload</p>
                        </div>
                        <button
                          onClick={handlePDFUpload}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center mx-auto"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose PDF File
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handlePDFChange}
                    className="hidden"
                  />
                </div>
              )}

              {/* Excerpt */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Article Excerpt</label>
                <textarea
                  value={editorForm.excerpt}
                  onChange={(e) => setEditorForm({ ...editorForm, excerpt: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Brief description of the article..."
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Publish Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editorForm.status}
                      onChange={(e) => setEditorForm({ ...editorForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Folder className="h-5 w-5 mr-2" />
                  Biblical Book/Category
                </h3>
                
                <select
                  value={editorForm.category}
                  onChange={(e) => setEditorForm({ ...editorForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {biblicalBooks.slice(1).map(book => (
                    <option key={book} value={book}>{book}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  Tags
                </h3>
                
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add tag..."
                    />
                    <button
                      onClick={addTag}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {editorForm.tags.map(tag => (
                      <span key={tag} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Image className="h-5 w-5 mr-2" />
                  Featured Image
                </h3>
                
                <div className="space-y-3">
                  <input
                    type="url"
                    value={editorForm.featuredImage}
                    onChange={(e) => setEditorForm({ ...editorForm, featuredImage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Image URL..."
                  />
                  
                  <button 
                    onClick={handleImageUpload}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  
                  {editorForm.featuredImage && (
                    <div className="mt-3">
                      <img
                        src={editorForm.featuredImage}
                        alt="Featured"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-blue-900 mb-2">Article Management</h1>
              <p className="text-xl text-gray-600">Create and manage biblical articles and resources</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Article
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Articles</p>
                  <p className="text-3xl font-bold text-blue-900">{articles.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Published</p>
                  <p className="text-3xl font-bold text-green-900">
                    {articles.filter(a => a.status === 'published').length}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Drafts</p>
                  <p className="text-3xl font-bold text-yellow-900">
                    {articles.filter(a => a.status === 'draft').length}
                  </p>
                </div>
                <Edit3 className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Views</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {articles.reduce((sum, a) => sum + a.views, 0)}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {biblicalBooks.map(book => (
                  <option key={book} value={book}>{book}</option>
                ))}
              </select>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'All' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Articles List */}
        <div className="space-y-6">
          {filteredArticles.map((article) => (
            <div key={article.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-start space-x-6">
                {/* Featured Image */}
                {article.featuredImage && (
                  <div className="w-32 h-24 flex-shrink-0">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(article.category)}`}>
                        {article.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(article.status)}`}>
                        {article.status}
                      </span>
                      {article.contentType === 'pdf' && (
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                          <File className="h-3 w-3 mr-1" />
                          PDF
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(article)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                        title="Edit Article"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleViewArticle(article)}
                        disabled={article.status !== 'published'}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          article.status === 'published'
                            ? 'text-gray-600 hover:bg-gray-100'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        title={article.status === 'published' ? 'View Article' : 'Article not published'}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {article.contentType === 'pdf' && (
                        <button
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                        title="Delete Article"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 
                    className={`text-xl font-bold text-blue-900 mb-2 ${
                      article.status === 'published' ? 'hover:text-blue-600 cursor-pointer' : ''
                    }`}
                    onClick={() => handleViewArticle(article)}
                  >
                    {article.title}
                  </h3>

                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {article.excerpt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {article.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {article.publishedDate || article.createdDate}
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {article.readTime} min read
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {article.views} views
                      </div>
                      {article.status === 'published' && (
                        <div className="text-blue-600">
                          /article/{article.slug}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No articles found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleEditor;