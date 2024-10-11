import React from 'react';
import { Box, Divider, useColorMode } from '@chakra-ui/react';
import QuestionDisplay from './QuestionDisplay';
import AdditionalInfo from './AdditionalInfo';
import QuizNavigation from './QuizNavigation';

interface QuizContentProps {
  state: any;
  actions: any;
  navigation: any;
}

const QuizContent: React.FC<QuizContentProps> = ({ state, actions, navigation }) => {
  const { colorMode } = useColorMode();
  const cardBgColor = colorMode === 'dark' ? 'gray.700' : 'gray.50';
  const cardTextColor = colorMode === 'dark' ? 'white' : 'black';

  const currentQuestion = state.filteredQuestions[state.currentQuestionIndex];

  return (
    <Box>
      {currentQuestion && (
        <>
          <QuestionDisplay
            question={currentQuestion}
            onOptionSelect={actions.handleOptionSelect}
            selectedOption={currentQuestion.userSelectedOption}
            cardBgColor={cardBgColor}
            cardTextColor={cardTextColor}
            unselectedOptionBg={colorMode === 'dark' ? 'gray.600' : 'white'}
          />

          {state.showFlipCard && (
            <>
              <QuizNavigation
                handleNavigate={actions.handleNavigate}
                iconHoverBg={state.iconHoverBg}
                iconButtonSize={state.iconButtonSize}
                flexWrapValue={state.flexWrapValue}
                isCardFlipped={state.isCardFlipped}
                handleFlipCard={actions.handleFlipCard}
                cardBgColor={cardBgColor}
                displayedQuestion={currentQuestion}
              />

              {state.isCardFlipped && (
                <>
                  <Divider my={4} />
                  <AdditionalInfo
                    url={currentQuestion.url || ""}
                    explanation={currentQuestion.explanation || ""}
                    discussion_link={currentQuestion.discussion_link}
                    question_id={currentQuestion.id}
                    questionDetails={{
                      question_text: currentQuestion.question,
                      options: currentQuestion.options,
                      answer: currentQuestion.answer,
                    }}
                  />
                  <Divider my={4} />
                </>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default QuizContent;
