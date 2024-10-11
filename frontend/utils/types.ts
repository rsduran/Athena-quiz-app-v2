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