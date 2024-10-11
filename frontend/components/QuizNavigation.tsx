import React from 'react';
import { Flex, IconButton, Box } from '@chakra-ui/react';
import { ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons';
import FlipCard from './FlipCard';

interface QuizNavigationProps {
  handleNavigate: (action: string) => void;
  iconHoverBg: string;
  iconButtonSize: string;
  flexWrapValue: any;
  isCardFlipped: boolean;
  handleFlipCard: () => void;
  cardBgColor: string;
  displayedQuestion: any;
}

const QuizNavigation: React.FC<QuizNavigationProps> = ({
  handleNavigate,
  iconHoverBg,
  iconButtonSize,
  flexWrapValue,
  isCardFlipped,
  handleFlipCard,
  cardBgColor,
  displayedQuestion
}) => {
  return (
    <Flex
      justify="center"
      alignItems="center"
      my={4}
      gap={2}
      direction="row"
      wrap={flexWrapValue}
    >
      {/* Previous Button */}
      <IconButton
        aria-label="Previous"
        icon={<ArrowLeftIcon />}
        onClick={() => handleNavigate('prev')}
        backgroundColor="transparent"
        _hover={{
          backgroundColor: iconHoverBg,
          borderRadius: 'full',
          borderColor: 'transparent',
        }}
        isRound
        size={iconButtonSize}
        flexShrink={0}
      />

      {/* Flip Card */}
      <Box flex="1" maxWidth="300px">
        <FlipCard
          isFlipped={isCardFlipped}
          onClick={handleFlipCard}
          frontContent={
            <Box p={4} textAlign="center">
              Click to reveal answer
            </Box>
          }
          backContent={
            <Box p={4} textAlign="center">
              Answer: {displayedQuestion.answer}
            </Box>
          }
          bgColor={cardBgColor}
        />
      </Box>

      {/* Next Button */}
      <IconButton
        aria-label="Next"
        icon={<ArrowRightIcon />}
        onClick={() => handleNavigate('next')}
        backgroundColor="transparent"
        _hover={{
          backgroundColor: iconHoverBg,
          borderRadius: 'full',
          borderColor: 'transparent',
        }}
        isRound
        size={iconButtonSize}
        flexShrink={0}
      />
    </Flex>
  );
};

export default QuizNavigation;
