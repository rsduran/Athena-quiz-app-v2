// QuestionDisplay.tsx

import React from 'react';
import { Box, Text, useColorModeValue, useBreakpointValue } from '@chakra-ui/react';
import { MathJax } from 'better-react-mathjax';
import { Question } from '../utils/types';

type QuestionDisplayProps = {
  question: Question;
  onOptionSelect: (optionIndex: number | null) => void;
  selectedOption: string | null;
  cardBgColor: string;
  cardTextColor: string;
  unselectedOptionBg: string;
};

const transformMathContent = (content: string): string => {
  // Replace span-wrapped expressions
  let transformedContent = content.replace(/<span class=\"mathjax\">(.*?)<\/span>/g, '$$$1$$');

  // Pattern to identify raw LaTeX expressions
  const latexPattern = /\\\[([\s\S]*?)\\\]/g;
  transformedContent = transformedContent.replace(latexPattern, (match, p1) => `$$${p1}$$`);

  return transformedContent;
};

const processTextForImages = (
  text: string,
  isOption: boolean,
  baseUrl: string = "https://www.indiabix.com"
): string => {
  let processedText: string = text;

  if (isOption) {
    // Remove any leading <br> tags in options
    processedText = processedText.replace(/^(\s*<br\s*\/?>)+/gi, '');
  }

  const imagePattern: RegExp = /<img[^>]*src="([^"]*)"[^>]*>/gi;
  processedText = processedText.replace(
    imagePattern,
    (match: string, imgUrl: string): string => {
      if (imgUrl.startsWith('/')) {
        imgUrl = `${baseUrl}${imgUrl}`;
      }

      if (isOption) {
        // For options, adjust the image styling
        return `<img src="${imgUrl}" alt="Image" style="display: inline-block; vertical-align: middle; margin: 0; width: auto; height: auto;">`;
      } else {
        // For question text, keep the centering
        return `<div style="text-align: center;"><img src="${imgUrl}" alt="Image" style="display: block; margin: 0 auto; width: auto; height: auto;"></div>`;
      }
    }
  );

  return processedText;
};

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  onOptionSelect,
  selectedOption,
  cardBgColor,
  cardTextColor,
  unselectedOptionBg,
}) => {
  const selectedBorderColor = useColorModeValue('blue.500', 'blue.300');
  const unselectedBorderColor = useColorModeValue('gray.200', 'gray.600');
  const selectedTextColor = useColorModeValue('blue.600', 'blue.200');
  const unselectedTextColor = cardTextColor;

  const optionPadding = useBreakpointValue({ base: 4, md: 2 });
  const optionFontSize = useBreakpointValue({ base: 'md', md: 'sm' });

  const handleOptionClick = (optionIndex: number) => {
    const optionLabel = `Option ${String.fromCharCode(65 + optionIndex)}`;
    if (selectedOption === optionLabel) {
      onOptionSelect(null);
    } else {
      onOptionSelect(optionIndex);
    }
  };

  const processedQuestion = processTextForImages(
    transformMathContent(question.question || 'Question'),
    false
  );  

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} bg={cardBgColor} color={cardTextColor}>
      <MathJax dynamic>
        <Text
          fontFamily="'HurmeGeometricSans2', -apple-system, 'system-ui', sans-serif"
          fontSize="xl"
          mb={4}
        >
          <Box as="span" dangerouslySetInnerHTML={{ __html: processedQuestion }} />
        </Text>
      </MathJax>

      {question.options.map((option, index) => {
        const optionLabel = `Option ${String.fromCharCode(65 + index)}`;
        const isSelected = selectedOption === optionLabel;

        const transformedOption = transformMathContent(option);
        const processedOption = processTextForImages(transformedOption, true);

        return (
          <Box
            key={index}
            p={optionPadding}
            my={2}
            borderWidth="2px"
            borderRadius="lg"
            borderColor={isSelected ? selectedBorderColor : unselectedBorderColor}
            bg={unselectedOptionBg}
            onClick={() => handleOptionClick(index)}
            cursor="pointer"
            fontFamily="'HurmeGeometricSans2', -apple-system, 'system-ui', sans-serif"
            color={isSelected ? selectedTextColor : unselectedTextColor}
            _hover={{ borderColor: selectedBorderColor }}
            fontSize={optionFontSize}
            display="flex"
            alignItems="center"
          >
            <MathJax dynamic>
              <Box as="span" dangerouslySetInnerHTML={{ __html: processedOption }} width="100%" />
            </MathJax>
          </Box>
        );
      })}
    </Box>
  );
};

export default QuestionDisplay;