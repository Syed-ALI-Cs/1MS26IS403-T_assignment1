import React, { useState } from 'react';
import { PracticeQuestions } from '../types/studykit';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  RotateCcw, 
  CheckSquare, 
  Square,
  Award, 
  Lightbulb, 
  Globe,
  FileText
} from 'lucide-react';

interface PracticeQuestionsSectionProps {
  questions: PracticeQuestions;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const PracticeQuestionsSection: React.FC<PracticeQuestionsSectionProps> = ({
  questions,
  difficulty
}) => {
  // MCQ state
  const [selectedMcqIndex, setSelectedMcqIndex] = useState<number | null>(null);
  const [mcqSubmitted, setMcqSubmitted] = useState<boolean>(false);

  // Short Answer state
  const [studentShortAnswer, setStudentShortAnswer] = useState<string>('');
  const [showShortAnswerSample, setShowShortAnswerSample] = useState<boolean>(false);
  const [checkedPoints, setCheckedPoints] = useState<Record<number, boolean>>({});

  // Conceptual Application state
  const [studentAppAnswer, setStudentAppAnswer] = useState<string>('');
  const [showAppSample, setShowAppSample] = useState<boolean>(false);

  const { mcq, shortAnswer, conceptualApplication } = questions;

  const handleSelectOption = (index: number) => {
    if (mcqSubmitted) return;
    setSelectedMcqIndex(index);
    setMcqSubmitted(true);
  };

  const togglePointCheck = (index: number) => {
    setCheckedPoints(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleResetExam = () => {
    setSelectedMcqIndex(null);
    setMcqSubmitted(false);
    setStudentShortAnswer('');
    setShowShortAnswerSample(false);
    setCheckedPoints({});
    setStudentAppAnswer('');
    setShowAppSample(false);
  };

  const isMcqCorrect = selectedMcqIndex === mcq.correctOptionIndex;

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            2
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900">Practice Exam Questions</h2>
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                difficulty === 'hard'
                  ? 'bg-amber-100 text-amber-800'
                  : difficulty === 'easy'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-indigo-100 text-indigo-800'
              }`}>
                {difficulty} Level
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              3 distinct question formats grounded strictly in your source material
            </p>
          </div>
        </div>

        <button
          onClick={handleResetExam}
          className="inline-flex items-center self-start sm:self-auto space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
          title="Clear answers and retake"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Exam Answers</span>
        </button>
      </div>

      <div className="p-5 sm:p-6 space-y-8 divide-y divide-slate-100">
        {/* Question 1: Multiple Choice Question */}
        <div className="pt-2 first:pt-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              Question 1 • Multiple Choice Question (MCQ)
            </span>
            {mcqSubmitted && (
              <span className={`inline-flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                isMcqCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {isMcqCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>{isMcqCorrect ? 'Correct! (+1 Mark)' : 'Incorrect'}</span>
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-4 leading-snug">
            {mcq.question}
          </h3>

          {/* 4 Choices */}
          <div className="grid grid-cols-1 gap-2.5 mb-4">
            {mcq.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedMcqIndex === idx;
              const isCorrect = idx === mcq.correctOptionIndex;

              let optionStyle = 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 text-slate-800';

              if (mcqSubmitted) {
                if (isCorrect) {
                  optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500 font-semibold';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-medium';
                } else {
                  optionStyle = 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  disabled={mcqSubmitted}
                  className={`flex items-start text-left p-3.5 rounded-xl border transition-all ${optionStyle}`}
                >
                  <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mr-3 mt-0.5 ${
                    mcqSubmitted && isCorrect
                      ? 'bg-emerald-600 text-white'
                      : mcqSubmitted && isSelected && !isCorrect
                      ? 'bg-rose-600 text-white'
                      : 'bg-white border border-slate-300 text-slate-700'
                  }`}>
                    {letter}
                  </span>
                  <span className="text-sm leading-relaxed flex-1">{option}</span>
                </button>
              );
            })}
          </div>

          {/* MCQ Explanation Box */}
          {mcqSubmitted && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
              <div className="flex items-center space-x-2 text-indigo-700 font-bold mb-1">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Explanation & Source Rationale:</span>
              </div>
              <p className="text-slate-700 leading-relaxed pl-6">
                {mcq.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Question 2: Short Answer Question */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Question 2 • Short Answer Question
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-3 leading-snug">
            {shortAnswer.question}
          </h3>

          {/* Student interactive answer box */}
          <div className="space-y-2 mb-4">
            <label className="block text-xs font-semibold text-slate-600">
              Practice drafting your answer below:
            </label>
            <textarea
              rows={3}
              value={studentShortAnswer}
              onChange={(e) => setStudentShortAnswer(e.target.value)}
              placeholder="Draft your concise answer here before checking the scoring criteria..."
              className="w-full px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
            />
          </div>

          {/* Toggle sample answer */}
          <div>
            {!showShortAnswerSample ? (
              <button
                type="button"
                onClick={() => setShowShortAnswerSample(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Reveal High-Scoring Sample Answer</span>
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-indigo-600" />
                      Sample High-Scoring Answer:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowShortAnswerSample(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 underline"
                    >
                      Hide
                    </button>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed bg-white p-3.5 rounded-lg border border-indigo-100/80">
                    {shortAnswer.sampleAnswer}
                  </p>
                </div>

                {/* Key Points Grading Checklist */}
                {shortAnswer.keyPoints && shortAnswer.keyPoints.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block mb-2">
                      Key Grading Points (Check off items you included):
                    </span>
                    <div className="space-y-2">
                      {shortAnswer.keyPoints.map((point, pIdx) => {
                        const isChecked = !!checkedPoints[pIdx];
                        return (
                          <div
                            key={pIdx}
                            onClick={() => togglePointCheck(pIdx)}
                            className="flex items-start space-x-2.5 cursor-pointer text-xs sm:text-sm text-slate-700 hover:text-indigo-900"
                          >
                            <span className="mt-0.5 text-indigo-600">
                              {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                            </span>
                            <span className={isChecked ? 'line-through text-slate-400' : ''}>
                              {point}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Question 3: Conceptual Application Question */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              Question 3 • Conceptual Application Question
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              Concept: {conceptualApplication.conceptApplied}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-3 leading-snug">
            {conceptualApplication.question}
          </h3>

          {conceptualApplication.realWorldScenario && (
            <div className="mb-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700">
              <span className="font-bold text-slate-900 block mb-1">Scenario Context:</span>
              <p className="leading-relaxed">{conceptualApplication.realWorldScenario}</p>
            </div>
          )}

          {/* Student analysis draft */}
          <div className="space-y-2 mb-4">
            <label className="block text-xs font-semibold text-slate-600">
              Your conceptual analysis:
            </label>
            <textarea
              rows={3}
              value={studentAppAnswer}
              onChange={(e) => setStudentAppAnswer(e.target.value)}
              placeholder="Explain how the concept applies to this specific situation..."
              className="w-full px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
            />
          </div>

          {/* Toggle Model Analysis */}
          <div>
            {!showAppSample ? (
              <button
                type="button"
                onClick={() => setShowAppSample(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Reveal Real-World Conceptual Analysis</span>
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-600" />
                    Model Conceptual Breakdown:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAppSample(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 underline"
                  >
                    Hide
                  </button>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed bg-white p-3.5 rounded-lg border border-indigo-100/80">
                  {conceptualApplication.sampleAnalysis}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
