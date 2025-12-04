export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
}

export interface KeyEntities {
  people?: string[];
  organizations?: string[];
  locations?: string[];
}

export interface Quiz {
  id: string;
  url: string;
  title: string;
  summary: string;
  key_entities: KeyEntities;
  sections: string[];
  quiz: QuizQuestion[];
  related_topics: string[];
  created_at: string;
}

export interface QuizState {
  currentQuestionIndex: number;
  selectedAnswers: Record<number, string>;
  showResults: boolean;
  score: number;
}
