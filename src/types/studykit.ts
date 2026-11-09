export interface KeyConcept {
  title: string;
  explanation: string;
}

export interface MCQQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface ShortAnswerQuestion {
  question: string;
  sampleAnswer: string;
  keyPoints: string[];
}

export interface ConceptualApplicationQuestion {
  question: string;
  conceptApplied: string;
  realWorldScenario: string;
  sampleAnalysis: string;
}

export interface PracticeQuestions {
  mcq: MCQQuestion;
  shortAnswer: ShortAnswerQuestion;
  conceptualApplication: ConceptualApplicationQuestion;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface StudyKitData {
  id: string;
  title: string;
  summaryOverview: string;
  difficulty: 'easy' | 'medium' | 'hard';
  keyConcepts: KeyConcept[];
  practiceQuestions: PracticeQuestions;
  flashcards: Flashcard[];
  generatedAt: string;
  sourceType: 'text' | 'image' | 'hybrid';
  sourceSnippet?: string;
}
