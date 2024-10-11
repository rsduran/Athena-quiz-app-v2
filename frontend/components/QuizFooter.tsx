import React from 'react';
import { Box } from '@chakra-ui/react';
import SearchModal from './SearchModal';
import UnansweredQuestionsModal from './UnansweredQuestionsModal';
import SummaryModal from './SummaryModal';
import ConfirmationModal from './ConfirmationModal';
import ResetModal from './ResetModal';
import { Question } from '@/utils/types';

interface QuizFooterProps {
  state: any;
  actions: any;
}

const QuizFooter: React.FC<QuizFooterProps> = ({ state, actions }) => {
  return (
    <Box>
      <SearchModal
        isOpen={state.isSearchModalOpen}
        onClose={actions.onSearchModalClose}
        searchKeyword={state.searchKeyword}
        onSearchChange={actions.handleSearchChange}
        questions={state.questions}
        onNavigateToQuestion={actions.onNavigateToQuestion}
        favorites={state.favorites}
        currentFilter={state.selectedFilter}
        getQuestionIndex={(questionId) => actions.getQuestionIndex(questionId, state.selectedFilter)}
      />

      <UnansweredQuestionsModal
        isOpen={state.isUnansweredQuestionsModalOpen}
        onClose={() => actions.setIsUnansweredQuestionsModalOpen(false)}
        unansweredQuestions={state.unansweredQuestions}
        navigateToQuestion={actions.onNavigateToQuestion}
        favorites={state.favorites}
        setSelectedFilter={actions.setSelectedFilter}
        onSubmitWithUnanswered={actions.onSubmitWithUnanswered}
        currentFilter={state.selectedFilter}
        getQuestionIndex={(questionId) => actions.getQuestionIndex(questionId, state.selectedFilter)}
      />

      <SummaryModal
        isOpen={state.isSummaryModalOpen}
        onClose={() => actions.setIsSummaryModalOpen(false)}
        score={state.score}
        totalQuestions={state.questions.length}
        navigateToIncorrect={actions.navigateToIncorrect}
        incorrectQuestionsCount={state.questions.filter((q: Question) => q.userSelectedOption !== q.answer).length}
      />

      <ConfirmationModal
        isOpen={state.isConfirmationModalOpen}
        onClose={actions.onConfirmationModalClose}
        onConfirm={actions.confirmShuffleQuestions}
      />

      <ResetModal
        isOpen={state.isResetModalOpen}
        onClose={actions.onResetModalClose}
        onReset={actions.handleReset}
      />
    </Box>
  );
};

export default QuizFooter;
