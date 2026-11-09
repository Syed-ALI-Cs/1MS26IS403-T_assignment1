import React, { useState, useEffect } from 'react';
import { StudyKitData } from './types/studykit';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { KeyConceptsSection } from './components/KeyConceptsSection';
import { PracticeQuestionsSection } from './components/PracticeQuestionsSection';
import { FlashcardsSection } from './components/FlashcardsSection';
import { PomodoroTimer } from './components/PomodoroTimer';
import { ExportModal } from './components/ExportModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { 
  BookOpen, 
  FileQuestion, 
  Layers, 
  Sparkles, 
  AlertCircle, 
  RotateCcw, 
  Share2, 
  Sliders,
  CheckCircle2,
  GraduationCap,
  Timer
} from 'lucide-react';

const STORAGE_KEY = 'studykit_ai_history_v1';

export default function App() {
  const [currentKit, setCurrentKit] = useState<StudyKitData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'concepts' | 'questions' | 'flashcards'>('concepts');
  const [showTimer, setShowTimer] = useState<boolean>(true);

  const [savedKits, setSavedKits] = useState<StudyKitData[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showExport, setShowExport] = useState<boolean>(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedKits(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, []);

  const saveKitToHistory = (newKit: StudyKitData) => {
    try {
      const filtered = savedKits.filter(k => k.id !== newKit.id);
      const updated = [newKit, ...filtered].slice(0, 15);
      setSavedKits(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save kit:', e);
    }
  };

  const handleDeleteKit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedKits.filter(k => k.id !== id);
    setSavedKits(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    if (currentKit?.id === id) {
      setCurrentKit(null);
    }
  };

  const handleClearAllHistory = () => {
    setSavedKits([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async (params: {
    text: string;
    image: { data: string; mimeType: string } | null;
    difficulty: 'easy' | 'medium' | 'hard';
  }) => {
    setIsLoading(true);
    setError(null);
    setLoadingStep('Reading & parsing study material...');

    // Progress simulation steps
    const stepTimer1 = setTimeout(() => {
      setLoadingStep('Extracting 3–5 core academic concepts...');
    }, 2000);
    const stepTimer2 = setTimeout(() => {
      setLoadingStep('Crafting MCQ, Short Answer & Application questions...');
    }, 4500);
    const stepTimer3 = setTimeout(() => {
      setLoadingStep('Formatting structured 5–10 flashcard deck...');
    }, 7000);

    try {
      const response = await fetch('/api/study-kit/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();

      const kitData: StudyKitData = {
        id: `kit_${Date.now()}`,
        title: data.title || 'Study Material Kit',
        summaryOverview: data.summaryOverview || '',
        difficulty: data.difficulty || params.difficulty,
        keyConcepts: data.keyConcepts || [],
        practiceQuestions: data.practiceQuestions,
        flashcards: data.flashcards || [],
        generatedAt: data.generatedAt || new Date().toISOString(),
        sourceType: params.image ? (params.text ? 'hybrid' : 'image') : 'text',
        sourceSnippet: params.text ? params.text.slice(0, 300) : 'Document Image'
      };

      setCurrentKit(kitData);
      saveKitToHistory(kitData);
      setActiveSection('concepts');
    } catch (err: any) {
      console.error('Generation failed:', err);
      setError(err.message || 'An error occurred while generating the study kit.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleResetToUpload = () => {
    setCurrentKit(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      {/* Navigation Header */}
      <Header
        hasKit={!!currentKit}
        onReset={handleResetToUpload}
        onOpenExport={() => setShowExport(true)}
        savedKitsCount={savedKits.length}
        onToggleHistory={() => setShowHistory(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Error message */}
        {error && (
          <div className="max-w-4xl mx-auto mt-6 px-4">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Generation Notice:</span>
                <p className="mt-0.5 text-rose-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-900 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="max-w-2xl mx-auto mt-16 px-4 text-center">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-md">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                  <GraduationCap className="w-6 h-6" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Assembling Your Exam Study Kit
              </h3>
              <p className="text-sm text-indigo-600 font-medium animate-pulse mb-6">
                {loadingStep || 'Processing material with Gemini...'}
              </p>

              <div className="max-w-sm mx-auto space-y-2 text-xs text-slate-500 text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Strict source-material boundary (no web search)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>3 target questions: MCQ, Short Answer, Application</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Flashcards strictly formatted between 5 and 10 items</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State 1: Upload View */}
        {!currentKit && !isLoading && (
          <UploadSection onGenerate={handleGenerate} isLoading={isLoading} />
        )}

        {/* State 2: Active Study Kit View */}
        {currentKit && !isLoading && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
            {/* Kit Title Banner */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 mb-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wide">
                      Study Kit
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                      currentKit.difficulty === 'hard'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : currentKit.difficulty === 'easy'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                    }`}>
                      {currentKit.difficulty} Difficulty
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(currentKit.generatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {currentKit.title}
                  </h1>

                  {currentKit.summaryOverview && (
                    <p className="mt-1 text-sm text-slate-600 max-w-3xl">
                      {currentKit.summaryOverview}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setShowTimer(!showTimer)}
                    className={`inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                      showTimer
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Toggle study session Pomodoro timer"
                  >
                    <Timer className="w-3.5 h-3.5" />
                    <span>{showTimer ? 'Hide Timer' : 'Focus Timer'}</span>
                  </button>
                  <button
                    onClick={() => setShowExport(true)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Export / Print</span>
                  </button>
                  <button
                    onClick={handleResetToUpload}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>New Kit</span>
                  </button>
                </div>
              </div>

              {/* Navigation Tabs for the 3 Structured Sections */}
              <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto">
                <button
                  onClick={() => setActiveSection('concepts')}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    activeSection === 'concepts'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>1. Key Concepts ({currentKit.keyConcepts.length})</span>
                </button>

                <button
                  onClick={() => setActiveSection('questions')}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    activeSection === 'questions'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileQuestion className="w-4 h-4" />
                  <span>2. Practice Exam (3 Questions)</span>
                </button>

                <button
                  onClick={() => setActiveSection('flashcards')}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    activeSection === 'flashcards'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>3. Flashcards ({currentKit.flashcards.length})</span>
                </button>
              </div>
            </div>

            {/* Pomodoro Study Session Timer Component */}
            {showTimer && (
              <PomodoroTimer
                currentSectionTitle={
                  activeSection === 'concepts'
                    ? '1. Key Concepts & Summaries'
                    : activeSection === 'questions'
                    ? '2. Practice Exam Questions'
                    : '3. Flashcard Revision Deck'
                }
              />
            )}

            {/* Display Selected Section */}
            <div className="space-y-8">
              {activeSection === 'concepts' && (
                <KeyConceptsSection
                  concepts={currentKit.keyConcepts}
                  summaryOverview={currentKit.summaryOverview}
                />
              )}

              {activeSection === 'questions' && (
                <PracticeQuestionsSection
                  questions={currentKit.practiceQuestions}
                  difficulty={currentKit.difficulty}
                />
              )}

              {activeSection === 'flashcards' && (
                <FlashcardsSection
                  initialFlashcards={currentKit.flashcards}
                />
              )}
            </div>

            {/* Section Quick Switcher Footer */}
            <div className="mt-8 p-4 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span className="font-medium">
                Jump to kit section:
              </span>
              <div className="flex items-center space-x-3 font-semibold">
                <button
                  onClick={() => { setActiveSection('concepts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`hover:text-indigo-600 ${activeSection === 'concepts' ? 'text-indigo-600 underline' : ''}`}
                >
                  Key Concepts
                </button>
                <span>•</span>
                <button
                  onClick={() => { setActiveSection('questions'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`hover:text-indigo-600 ${activeSection === 'questions' ? 'text-indigo-600 underline' : ''}`}
                >
                  Practice Questions (MCQ, Short Answer, Application)
                </button>
                <span>•</span>
                <button
                  onClick={() => { setActiveSection('flashcards'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`hover:text-indigo-600 ${activeSection === 'flashcards' ? 'text-indigo-600 underline' : ''}`}
                >
                  Flashcard Set
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Export Modal */}
      {showExport && currentKit && (
        <ExportModal
          kit={currentKit}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        savedKits={savedKits}
        onSelectKit={(kit) => {
          setCurrentKit(kit);
          setActiveSection('concepts');
        }}
        onDeleteKit={handleDeleteKit}
        onClearAll={handleClearAllHistory}
      />
    </div>
  );
}
