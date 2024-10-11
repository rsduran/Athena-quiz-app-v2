// quizUtils.ts

import { Question, QuestionData } from './types';

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const shuffleOptionsAndUpdateAnswer = (questions: Question[]): Question[] => {
  console.log("Shuffling options for each question");
  return questions.map((question: Question) => {
    console.log('Original question:', question);

    // Create a copy of the options to shuffle
    const options = shuffleArray(question.options);
    const correctAnswerContent = question.options.find(
      (opt, idx) => `Option ${String.fromCharCode(65 + idx)}` === question.answer
    );

    const newCorrectAnswerIndex = options.findIndex(opt => opt === correctAnswerContent);
    const newAnswerLabel = `Option ${String.fromCharCode(65 + newCorrectAnswerIndex)}`;

    const updatedQuestion: Question = {
      ...question,
      options,
      answer: newAnswerLabel,
    };

    console.log('Updated question:', updatedQuestion);

    return updatedQuestion;
  });
};

export const mapQuestionData = (data: QuestionData[]): Question[] => {
  return data.map((q: QuestionData) => ({
    id: q.id,
    order: q.order,
    question: q.text,
    options: q.options.slice(),
    originalOptions: q.options.slice(),
    answer: q.answer,
    url: q.url,
    explanation: q.explanation,
    discussion_link: q.discussion_link,
    hasMathContent: q.hasMathContent,
    userSelectedOption: null,
  }));
};

export const sortQuestionsByOrder = (questions: Question[]): Question[] => {
  return [...questions].sort((a: Question, b: Question) => a.order - b.order);
};

export const calculateScore = (questions: Question[]): number => {
  return questions.reduce((acc, question) => {
    const correct = question.userSelectedOption === question.answer;
    return acc + (correct ? 1 : 0);
  }, 0);
};

export const getFilteredQuestions = (questions: Question[], filter: string, favorites: Set<number>): Question[] => {
  switch (filter) {
    case 'favorites':
      return questions.filter(question => favorites.has(question.id));
    case 'answered':
      return questions.filter(q => q.userSelectedOption !== null);
    case 'unanswered':
      return questions.filter(q => q.userSelectedOption === null);
    case 'incorrect':
      return questions.filter(q => q.userSelectedOption !== q.answer);
    default:
      return questions;
  }
};

export const getQuestionIndex = (questions: Question[], questionId: number, filter: string, favorites: Set<number>): number => {
  const filteredList = getFilteredQuestions(questions, filter, favorites);
  return filteredList.findIndex(q => q.id === questionId);
};