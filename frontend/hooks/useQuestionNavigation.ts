import { useCallback } from 'react';
import { Question } from '@/utils/types';

interface UseQuestionNavigationProps {
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  filteredQuestions: Question[];
  setIsCardFlipped: (isFlipped: boolean) => void;
}

const useQuestionNavigation = ({
  currentQuestionIndex,
  setCurrentQuestionIndex,
  filteredQuestions,
  setIsCardFlipped,
}: UseQuestionNavigationProps) => {
  const handleNavigate = useCallback((action: string, value?: number) => {
    setIsCardFlipped(false);

    let newIndex = currentQuestionIndex;
    switch (action) {
      case 'prev':
        newIndex = Math.max(currentQuestionIndex - 1, 0);
        break;
      case 'next':
        newIndex = Math.min(currentQuestionIndex + 1, filteredQuestions.length - 1);
        break;
      case 'goto':
        newIndex = value ? value - 1 : currentQuestionIndex;
        break;
      case 'reset':
        setCurrentQuestionIndex(0);
        return;
    }
    if (newIndex >= 0 && newIndex < filteredQuestions.length) {
      if (newIndex !== currentQuestionIndex) {
        setIsCardFlipped(false);
      }
      setCurrentQuestionIndex(newIndex);
    }
  }, [currentQuestionIndex, filteredQuestions.length, setCurrentQuestionIndex, setIsCardFlipped]);

  const goToNext = useCallback(() => {
    handleNavigate('next');
  }, [handleNavigate]);

  const goToPrev = useCallback(() => {
    handleNavigate('prev');
  }, [handleNavigate]);

  const goToQuestion = useCallback((index: number) => {
    handleNavigate('goto', index);
  }, [handleNavigate]);

  return {
    handleNavigate,
    goToNext,
    goToPrev,
    goToQuestion,
  };
};

export default useQuestionNavigation;