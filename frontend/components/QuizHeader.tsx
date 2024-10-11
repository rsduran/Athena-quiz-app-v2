import React from 'react';
import {
  Flex,
  IconButton,
  Tooltip,
  Input,
  Text,
  useColorMode,
  useColorModeValue,
  useBreakpointValue,
  Button,
  Switch,
} from '@chakra-ui/react';
import {
  ExitIcon,
  UpdateIcon,
  EyeOpenIcon,
  EyeNoneIcon,
} from '@radix-ui/react-icons';
import { useRouter } from 'next/router';

interface QuizHeaderProps {
  state: any;
  actions: any;
  navigation: any;
  MobileMenu: React.ComponentType<any>;
  DesktopMenu: React.ComponentType<any>;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({ state, actions, navigation, MobileMenu, DesktopMenu }) => {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const iconBg = useColorModeValue('white', 'transparent');
  const iconHoverBg = useColorModeValue('#edf2f8', '#2c323d');
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex
      justifyContent="space-between"
      align="center"
      mb={4}
      direction="row"
      position="relative"
    >
      {/* Left Part */}
      <Flex align="center" gap={2}>
        {/* Back Button */}
        <Tooltip label="Go Back" aria-label="Go Back Tooltip">
          <IconButton
            aria-label="Go back"
            icon={<ExitIcon style={{ transform: 'scaleX(-1)', width: '20px', height: '20px' }} />}
            onClick={() => router.push('/Dashboard')}
            backgroundColor="transparent"
            _hover={{ backgroundColor: iconHoverBg }}
          />
        </Tooltip>
        {!isMobile && (
          <>
            {/* Reset Button */}
            <Tooltip label="Reset" aria-label="Reset Tooltip">
              <IconButton
                aria-label="Reset"
                icon={<UpdateIcon style={{ width: '20px', height: '20px' }} />}
                onClick={actions.onResetModalOpen}
                backgroundColor="transparent"
                _hover={{ backgroundColor: iconHoverBg }}
              />
            </Tooltip>
            {/* Hide Flip Card Button */}
            <Tooltip
              label={state.eyeIconState ? 'Hide Flip Card' : 'Show Flip Card'}
              aria-label="Toggle Flip Card Visibility Tooltip"
            >
              <IconButton
                aria-label="Toggle Flip Card Visibility"
                icon={
                  state.eyeIconState ? (
                    <EyeOpenIcon style={{ width: '20px', height: '20px' }} />
                  ) : (
                    <EyeNoneIcon style={{ width: '20px', height: '20px' }} />
                  )
                }
                onClick={actions.toggleFlipCardVisibility}
                backgroundColor="transparent"
                _hover={{ backgroundColor: iconHoverBg }}
              />
            </Tooltip>
            {/* Submit Button */}
            <Tooltip label="Submit" aria-label="Submit Tooltip">
              <Button
                onClick={actions.handleSubmit}
                backgroundColor="transparent"
                _hover={{ backgroundColor: iconHoverBg }}
              >
                Submit
              </Button>
            </Tooltip>
            {/* Shuffle Options Switch */}
            <Switch
              isChecked={state.optionsShuffled}
              onChange={actions.handleToggleShuffleOptions}
              size="lg"
              colorScheme="teal"
            />
          </>
        )}
      </Flex>

        {/* Middle Part for question navigation */}
        <Flex
          position="absolute"
          left="50%"
          transform="translateX(-50%)"
          align="center"
        >
          {/* Question Navigation Input */}
          <Input
            type="number"
            value={state.currentQuestionIndex + 1}
            onChange={(e) => navigation.handleNavigate('goto', Number(e.target.value))}
            width="75px"
            marginRight={2}
            fontSize="15px"
            textAlign="center"
          />
          <Text marginX={2} fontSize="15px">
            / {state.filteredQuestions.length}
          </Text>
        </Flex>

        {/* Right Part */}
        <Flex align="center" gap={2}>
          {isMobile ? (
            <MobileMenu state={state} actions={actions} />
          ) : (
            <DesktopMenu
              state={state}
              actions={actions}
            />
          )}
        </Flex>
      </Flex>
    );
  };

  export default QuizHeader;