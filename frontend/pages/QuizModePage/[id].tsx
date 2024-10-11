import React from 'react';
import { Box } from '@chakra-ui/react';
import QuizHeader from '../../components/QuizHeader';
import QuizContent from '../../components/QuizContent';
import QuizFooter from '../../components/QuizFooter';
import useQuizState from '../../hooks/useQuizState';
import useQuestionNavigation from '../../hooks/useQuestionNavigation';
import LoadingLayout from '../../components/LoadingLayout';
import MobileMenu from './components/MobileMenu';
import DesktopMenu from './components/DesktopMenu';

const QuizModePage = () => {
  const { state, actions } = useQuizState();
  const navigation = useQuestionNavigation({
    currentQuestionIndex: state.currentQuestionIndex,
    setCurrentQuestionIndex: actions.setCurrentQuestionIndex,
    filteredQuestions: state.filteredQuestions,
    setIsCardFlipped: actions.setIsCardFlipped
  });

  return (
    <LoadingLayout key={state.selectedFilter}>
      <Box p={4}>
        <QuizHeader
          state={state}
          actions={actions}
          navigation={navigation}
          MobileMenu={MobileMenu}
          DesktopMenu={DesktopMenu}
        />
        <QuizContent
          state={state}
          actions={actions}
          navigation={navigation}
        />
        <QuizFooter
          state={state}
          actions={actions}
        />
      </Box>
    </LoadingLayout>
  );
};

export default QuizModePage;