import React from 'react';
import { StudyKitData } from '../types/studykit';
import { X, Clock, BookOpen, Trash2, ArrowRight } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedKits: StudyKitData[];
  onSelectKit: (kit: StudyKitData) => void;
  onDeleteKit: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  savedKits,
  onSelectKit,
  onDeleteKit,
  onClearAll
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Saved Study Kits ({savedKits.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of kits */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedKits.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No saved study kits yet.</p>
              <p className="text-xs text-slate-500 mt-1">Generated kits will appear here automatically.</p>
            </div>
          ) : (
            savedKits.map((kit) => (
              <div
                key={kit.id}
                onClick={() => {
                  onSelectKit(kit);
                  onClose();
                }}
                className="group p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 line-clamp-1">
                    {kit.title}
                  </h4>
                  <button
                    onClick={(e) => onDeleteKit(kit.id, e)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors shrink-0"
                    title="Delete kit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                  {kit.summaryOverview || `${kit.keyConcepts.length} concepts • 3 practice questions • ${kit.flashcards.length} flashcards`}
                </p>

                <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 pt-2 border-t border-slate-100">
                  <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                    {kit.difficulty}
                  </span>
                  <span>{new Date(kit.generatedAt).toLocaleDateString()}</span>
                  <span className="text-indigo-600 font-semibold flex items-center group-hover:translate-x-0.5 transition-transform">
                    Open <ArrowRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Clear All Footer */}
        {savedKits.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={onClearAll}
              className="w-full py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
            >
              Clear All Saved Kits
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
