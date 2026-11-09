import React, { useState } from 'react';
import { StudyKitData } from '../types/studykit';
import { X, Copy, Download, Printer, Check, FileText } from 'lucide-react';

interface ExportModalProps {
  kit: StudyKitData;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ kit, onClose }) => {
  const [copied, setCopied] = useState(false);

  const generateMarkdown = (): string => {
    let md = `# Study Kit: ${kit.title}\n`;
    md += `*Generated: ${new Date(kit.generatedAt).toLocaleDateString()} | Difficulty: ${kit.difficulty.toUpperCase()}*\n\n`;

    if (kit.summaryOverview) {
      md += `> **Overview:** ${kit.summaryOverview}\n\n`;
    }

    md += `### 1. Key Concepts & Summaries\n\n`;
    kit.keyConcepts.forEach((concept, index) => {
      md += `* **${concept.title}:** ${concept.explanation}\n`;
    });
    md += `\n`;

    md += `### 2. Practice Exam Questions\n\n`;
    md += `#### Multiple Choice Question (MCQ)\n`;
    md += `**Question:** ${kit.practiceQuestions.mcq.question}\n\n`;
    kit.practiceQuestions.mcq.options.forEach((opt, idx) => {
      const letter = String.fromCharCode(65 + idx);
      const isCorrect = idx === kit.practiceQuestions.mcq.correctOptionIndex;
      md += `- [${letter}] ${opt}${isCorrect ? ' *(Correct Answer)*' : ''}\n`;
    });
    md += `\n**Explanation:** ${kit.practiceQuestions.mcq.explanation}\n\n`;

    md += `#### Short Answer Question\n`;
    md += `**Question:** ${kit.practiceQuestions.shortAnswer.question}\n\n`;
    md += `**Sample High-Scoring Answer:**\n${kit.practiceQuestions.shortAnswer.sampleAnswer}\n\n`;
    if (kit.practiceQuestions.shortAnswer.keyPoints?.length) {
      md += `*Key Points:*\n`;
      kit.practiceQuestions.shortAnswer.keyPoints.forEach((pt) => {
        md += `- ${pt}\n`;
      });
      md += `\n`;
    }

    md += `#### Conceptual Application Question\n`;
    md += `**Question:** ${kit.practiceQuestions.conceptualApplication.question}\n\n`;
    if (kit.practiceQuestions.conceptualApplication.realWorldScenario) {
      md += `*Scenario:* ${kit.practiceQuestions.conceptualApplication.realWorldScenario}\n\n`;
    }
    md += `**Sample Analysis:**\n${kit.practiceQuestions.conceptualApplication.sampleAnalysis}\n\n`;

    md += `### 3. Flashcard Set (JSON Format)\n\n`;
    md += '```json\n';
    md += JSON.stringify(kit.flashcards, null, 2);
    md += '\n```\n';

    return md;
  };

  const markdownContent = generateMarkdown();

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = kit.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.download = `study_kit_${safeTitle}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Export Study Kit</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-800 bg-slate-900 text-slate-200">
          <pre className="whitespace-pre-wrap leading-relaxed">
            {markdownContent}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print View</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Markdown' : 'Copy Markdown'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download .md</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
