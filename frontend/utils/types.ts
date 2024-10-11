// types.ts

export interface Question {
  id: number;
  order: number;
  question: string;
  options: string[];
  originalOptions?: string[]; // Optional, used for shuffling
  answer: string;
  url?: string;
  explanation: string;
  discussion_link: string;
  userSelectedOption: string | null;
  hasMathContent: boolean;
  quiz_set_id: string;
}

export interface QuestionData {
  id: number;
  order: number;
  text: string;
  options: string[];
  answer: string;
  url: string;
  explanation: string;
  discussion_link: string;
  userSelectedOption: string | null;
  hasMathContent: boolean;
}

export type NavigateToQuestionFunction = (index: number) => void;

export interface PreserveShuffleState {
  questionsShuffled: boolean;
  optionsShuffled: boolean;
}

export interface QuizSet {
  id: string;
  title: string;
  score: number | null;
  attempts: number;
  average_score: number | null;
  latest_score: number | null;
  total_questions: number;
  unanswered_questions: number;
  finished: boolean;
  progress: number;
}