import React from 'react';
import { GraduationCap, Sparkles, BookOpen, Clock, Download, RefreshCw } from 'lucide-react';

interface HeaderProps {
  hasKit: boolean;
  onReset: () => void;
  onOpenExport?: () => void;
  savedKitsCount?: number;
  onToggleHistory?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasKit,
  onReset,
  onOpenExport,
  savedKitsCount = 0,
  onToggleHistory
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onReset}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">StudyKit<span className="text-indigo-600">.AI</span></span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                Exam Prep
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Academic Note & Document Parser</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {savedKitsCount > 0 && onToggleHistory && (
            <button
              onClick={onToggleHistory}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Saved study kits"
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>History ({savedKitsCount})</span>
            </button>
          )}

          {hasKit && (
            <>
              {onOpenExport && (
                <button
                  onClick={onOpenExport}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Export Kit</span>
                  <span className="sm:hidden">Export</span>
                </button>
              )}
              <button
                onClick={onReset}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Material</span>
                <span className="sm:hidden">New</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
