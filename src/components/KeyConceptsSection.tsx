import React, { useState } from 'react';
import { KeyConcept } from '../types/studykit';
import { BookOpen, Volume2, VolumeX, Copy, Check, Sparkles } from 'lucide-react';

interface KeyConceptsSectionProps {
  concepts: KeyConcept[];
  summaryOverview?: string;
}

export const KeyConceptsSection: React.FC<KeyConceptsSectionProps> = ({
  concepts,
  summaryOverview
}) => {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleSpeak = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) return;

    if (playingIndex === index) {
      window.speechSynthesis.cancel();
      setPlayingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setPlayingIndex(null);
    utterance.onerror = () => setPlayingIndex(null);
    setPlayingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyConcept = (concept: KeyConcept, index: number) => {
    navigator.clipboard.writeText(`${concept.title}\n${concept.explanation}`);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    const formatted = concepts
      .map((c, i) => `${i + 1}. ${c.title}\n${c.explanation}`)
      .join('\n\n');
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            1
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Key Concepts & Summaries
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                {concepts.length} Core Concepts
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Extracted directly from source material in plain, easy-to-understand language
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyAll}
          className="inline-flex items-center self-start sm:self-auto space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
        >
          {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copiedAll ? 'Copied All' : 'Copy All Concepts'}</span>
        </button>
      </div>

      {/* Summary overview if present */}
      {summaryOverview && (
        <div className="px-6 pt-5 pb-2">
          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100/80 text-xs sm:text-sm text-indigo-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-900 mr-1.5">Overview:</span>
              <span className="text-indigo-900/90 leading-relaxed">{summaryOverview}</span>
            </div>
          </div>
        </div>
      )}

      {/* Concept list */}
      <div className="p-5 sm:p-6 space-y-4">
        {concepts.map((concept, index) => {
          const isPlaying = playingIndex === index;
          const isCopied = copiedIndex === index;

          return (
            <div
              key={index}
              className="group p-5 rounded-xl border border-slate-200 bg-slate-50/30 hover:bg-white hover:border-indigo-200 hover:shadow-xs transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center space-x-2.5">
                  <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {concept.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  {'speechSynthesis' in window && (
                    <button
                      onClick={() => handleSpeak(`${concept.title}. ${concept.explanation}`, index)}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${
                        isPlaying
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
                      }`}
                      title={isPlaying ? 'Stop audio' : 'Listen to concept'}
                    >
                      {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    onClick={() => handleCopyConcept(concept, index)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Copy concept"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed pl-8.5 font-normal">
                {concept.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
