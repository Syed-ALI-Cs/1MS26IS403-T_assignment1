import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Upload, 
  X, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  Sliders, 
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { SAMPLE_MATERIALS, SampleMaterial } from '../data/samples';

interface UploadSectionProps {
  onGenerate: (data: {
    text: string;
    image: { data: string; mimeType: string } | null;
    difficulty: 'easy' | 'medium' | 'hard';
  }) => Promise<void>;
  isLoading: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onGenerate, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [text, setText] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ data: string; mimeType: string } | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setValidationError('Please upload a valid image file (PNG, JPEG, or WEBP).');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setValidationError('Image size must be under 20MB.');
      return;
    }

    setValidationError(null);
    setImageFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setImageData({
        data: result,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        handleImageFile(file);
        setActiveTab('image');
      }
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageData(null);
    setImageFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const loadSample = (sample: SampleMaterial) => {
    setText(sample.content);
    setDifficulty(sample.suggestedDifficulty);
    setSelectedSampleId(sample.id);
    setActiveTab('text');
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const hasText = text.trim().length > 0;
    const hasImage = !!imageData;

    if (!hasText && !hasImage) {
      setValidationError('Please enter notes or upload a study document image before generating.');
      return;
    }

    onGenerate({
      text: text.trim(),
      image: imageData,
      difficulty
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero introduction */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Academic Study Kit Builder</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Turn Raw Study Material into <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Exam Mastery</span>
        </h1>
        <p className="mt-2.5 text-base text-slate-600 max-w-2xl mx-auto">
          Upload textbook excerpts, lecture notes, or document photos. Get core concepts, 3 targeted practice exam questions, and structured flashcards strictly derived from your source.
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden" onPaste={handlePaste}>
        {/* Sample selector pill bar */}
        <div className="bg-slate-50/70 border-b border-slate-200/80 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              Try sample materials:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_MATERIALS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => loadSample(sample)}
                  className={`text-xs px-3 py-1 rounded-lg border transition-all ${
                    selectedSampleId === sample.id && text === sample.content
                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                  }`}
                >
                  <span className="opacity-75 mr-1 font-mono text-[10px]">[{sample.category}]</span>
                  {sample.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Material Input Type Tabs */}
          <div className="flex items-center space-x-2 border-b border-slate-200 mb-5 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'text'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Notes / Text Material</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('image')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'image'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Document Image / Photo</span>
              {imageData && (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>
          </div>

          {/* Tab 1: Text Area */}
          {activeTab === 'text' && (
            <div className="space-y-2 mb-6">
              <label htmlFor="material-text" className="block text-sm font-semibold text-slate-800">
                Paste your study notes or textbook passage:
              </label>
              <textarea
                id="material-text"
                rows={7}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setSelectedSampleId(null);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Paste class notes, chapter excerpts, syllabus concepts, or bullet points here..."
                className="w-full px-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all leading-relaxed font-sans"
              />
              <div className="flex justify-between items-center text-xs text-slate-500 px-1">
                <span>Supports plain text, markdown, or outline format.</span>
                <span>{text.length} characters</span>
              </div>
            </div>
          )}

          {/* Tab 2: Document Image Uploader */}
          {activeTab === 'image' && (
            <div className="space-y-3 mb-6">
              <label className="block text-sm font-semibold text-slate-800">
                Upload textbook page, lecture slide, or handwritten note photo:
              </label>

              {!imagePreview ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 rounded-xl p-8 text-center cursor-pointer transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    Click to browse or drag and drop an image
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PNG, JPG, or WEBP up to 20MB. You can also paste directly with Ctrl+V / ⌘+V.
                  </p>
                </div>
              ) : (
                <div className="relative border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center space-x-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium text-slate-800 truncate max-w-xs">
                        {imageFileName || 'Uploaded Document'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex justify-center max-h-64 overflow-hidden rounded-lg bg-black/5">
                    <img
                      src={imagePreview}
                      alt="Uploaded study material"
                      className="max-h-64 object-contain rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Difficulty Toggle (Required by Constraint 4) */}
          <div className="pt-2 pb-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-800 flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Question Difficulty Level:</span>
              </label>
              <span className="text-xs text-slate-500">
                Adjusts exam question depth & distractor complexity
              </span>
            </div>

            {/* Prominent Radio Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'easy',
                  label: 'Easy',
                  badge: 'Direct Recall',
                  desc: 'Core definitions, foundational facts, distinct MCQ choices.'
                },
                {
                  id: 'medium',
                  label: 'Medium',
                  badge: 'Synthesis & Core',
                  desc: 'Standard exam rigor, synthesis of concepts, plausible distractors.'
                },
                {
                  id: 'hard',
                  label: 'Hard',
                  badge: 'Deep Nuance',
                  desc: 'Subtle edge cases, higher-order reasoning, challenging distractors.'
                }
              ].map((item) => (
                <label
                  key={item.id}
                  className={`relative flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                    difficulty === item.id
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="radio"
                        name="difficulty"
                        value={item.id}
                        checked={difficulty === item.id}
                        onChange={() => setDifficulty(item.id as 'easy' | 'medium' | 'hard')}
                        className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="font-bold text-sm text-slate-900">{item.label}</span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        difficulty === item.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug pl-6.5">
                    {item.desc}
                  </p>
                </label>
              ))}
            </div>
          </div>

          {/* Validation Error banner */}
          {validationError && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Constraints guarantee & Submit action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <div className="flex items-center space-x-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Strict source-grounded answers • Zero hallucination • 5–10 flashcards</span>
            </div>

            <button
              type="submit"
              disabled={isLoading || (!text.trim() && !imageData)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing Study Material...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Study Kit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
