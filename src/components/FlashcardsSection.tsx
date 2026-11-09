import React, { useState, useEffect } from 'react';
import { Flashcard } from '../types/studykit';
import { 
  Layers, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  Check, 
  X, 
  Code, 
  Grid, 
  CreditCard, 
  Copy, 
  Volume2
} from 'lucide-react';

interface FlashcardsSectionProps {
  initialFlashcards: Flashcard[];
}

export const FlashcardsSection: React.FC<FlashcardsSectionProps> = ({
  initialFlashcards
}) => {
  const [cards, setCards] = useState<Flashcard[]>(initialFlashcards);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'deck' | 'grid' | 'json'>('deck');
  const [masteredMap, setMasteredMap] = useState<Record<number, boolean>>({});
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  useEffect(() => {
    setCards(initialFlashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredMap({});
  }, [initialFlashcards]);

  const currentCard = cards[currentIndex] || cards[0];
  const totalCards = cards.length;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % totalCards);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setMasteredMap({});
  };

  const toggleMastered = (index: number, state: boolean) => {
    setMasteredMap((prev) => ({ ...prev, [index]: state }));
    if (currentIndex < totalCards - 1) {
      handleNext();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'deck') return;
      // Don't trigger if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, totalCards]);

  const masteredCount = Object.values(masteredMap).filter(Boolean).length;
  const jsonString = JSON.stringify(cards, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const speakText = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            3
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900">Flashcard Set</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                {totalCards} Cards (Constraint: 5–10)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review key definitions and core terminology with 3D flashcards or JSON array
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode('deck')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'deck'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Interactive Deck</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid View</span>
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'json'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>JSON Format</span>
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-8">
        {/* VIEW 1: Interactive 3D Deck */}
        {viewMode === 'deck' && (
          <div className="max-w-xl mx-auto flex flex-col items-center">
            {/* Top Toolbar: Progress & Shuffle */}
            <div className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 mb-3 px-1">
              <div className="flex items-center space-x-2">
                <span>Card {currentIndex + 1} of {totalCards}</span>
                {masteredCount > 0 && (
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {masteredCount} Mastered
                  </span>
                )}
              </div>
              <button
                onClick={handleShuffle}
                className="inline-flex items-center space-x-1 text-slate-500 hover:text-indigo-600 transition-colors"
                title="Shuffle flashcards"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle</span>
              </button>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-6">
              <div
                className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
              ></div>
            </div>

            {/* 3D Flip Card Container */}
            <div
              onClick={handleFlip}
              className="w-full h-72 sm:h-80 perspective-1000 cursor-pointer select-none group"
            >
              <div
                className={`relative w-full h-full duration-500 transform-style-3d transition-transform rounded-2xl shadow-md border ${
                  isFlipped ? 'rotate-y-180 border-indigo-200 bg-indigo-50/20' : 'border-slate-200 bg-white'
                }`}
              >
                {/* FRONT FACE: Term / Question */}
                <div className="absolute inset-0 backface-hidden p-6 sm:p-8 flex flex-col justify-between rounded-2xl bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                      Term / Question (Front)
                    </span>
                    <button
                      onClick={(e) => speakText(currentCard.front, e)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="my-auto text-center px-4">
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                      {currentCard.front}
                    </p>
                  </div>

                  <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 group-hover:text-indigo-600 transition-colors">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Click or press Space to reveal answer</span>
                  </div>
                </div>

                {/* BACK FACE: Definition / Answer */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 p-6 sm:p-8 flex flex-col justify-between rounded-2xl bg-gradient-to-b from-indigo-50/50 to-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                      Definition / Answer (Back)
                    </span>
                    <button
                      onClick={(e) => speakText(currentCard.back, e)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="my-auto text-center px-4">
                    <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
                      {currentCard.back}
                    </p>
                  </div>

                  <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Click to flip back to term</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation & Mastery Controls */}
            <div className="w-full mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Mastery Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => toggleMastered(currentIndex, false)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Still Learning</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleMastered(currentIndex, true)}
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    masteredMap[currentIndex]
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mastered</span>
                </button>
              </div>

              {/* Prev / Next controls */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
                  title="Previous card (Left Arrow)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleFlip}
                  className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-100"
                >
                  Flip
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
                  title="Next card (Right Arrow)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 hidden sm:block">
              Tip: Use Spacebar to flip, and Left/Right Arrow keys to cycle cards.
            </p>
          </div>
        )}

        {/* VIEW 2: Grid Overview */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-indigo-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      Card #{idx + 1}
                    </span>
                    {masteredMap[idx] && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Mastered
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">{card.front}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2">
                    {card.back}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 3: Clean JSON Format (Directly requested by prompt layout) */}
        {viewMode === 'json' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Parsed JSON array for programmatic frontend consumption:
              </span>
              <button
                type="button"
                onClick={handleCopyJson}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? 'Copied JSON!' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-indigo-200 text-xs rounded-xl overflow-x-auto font-mono max-h-96 leading-relaxed border border-slate-800">
              <code>{jsonString}</code>
            </pre>
          </div>
        )}
      </div>
    </section>
  );
};
