import React from 'react';
import {
  Flex,
  Select,
  IconButton,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react';
import {
  StarIcon,
  StarFilledIcon,
  ShuffleIcon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';

interface DesktopMenuProps {
  state?: {
    filteredQuestions?: any[];
    currentQuestionIndex?: number;
    selectedFilter?: string;
    favorites?: Set<number>;
    iconHoverBg?: string;
    iconBg?: string;
  };
  actions?: {
    handleDropdownChange?: (value: string) => void;
    handleToggleFavorites?: (id: number) => void;
    onConfirmationModalOpen?: () => void;
    onSearchModalOpen?: () => void;
  };
}

const DesktopMenu: React.FC<DesktopMenuProps> = ({ 
  state = {}, 
  actions = {}
}) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const {
    filteredQuestions = [],
    currentQuestionIndex = 0,
    selectedFilter = 'all',
    favorites = new Set(),
    iconHoverBg = '',
    iconBg = '',
  } = state;

  const {
    handleDropdownChange = () => {},
    handleToggleFavorites = () => {},
    onConfirmationModalOpen = () => {},
    onSearchModalOpen = () => {},
  } = actions;

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  return (
    <Flex align="center" gap={2}>
      <Select
        value={selectedFilter}
        onChange={(e) => handleDropdownChange(e.target.value)}
        width="180px"
      >
        <option value="all">All Questions</option>
        <option value="favorites">Favorites</option>
        <option value="incorrect">Incorrect</option>
        <option value="answered">Answered</option>
        <option value="unanswered">Unanswered</option>
      </Select>

      <Tooltip label="Favorites" aria-label="Favorites Tooltip">
        <IconButton
          aria-label="Favorites"
          icon={
            currentQuestion && favorites.has(currentQuestion.id) ? (
              <StarFilledIcon style={{ width: '20px', height: '20px' }} />
            ) : (
              <StarIcon style={{ width: '20px', height: '20px' }} />
            )
          }
          onClick={() => currentQuestion && handleToggleFavorites(currentQuestion.id)}
          backgroundColor="transparent"
          _hover={{ backgroundColor: iconHoverBg }}
          isDisabled={!currentQuestion}
        />
      </Tooltip>

      <Tooltip label="Shuffle" aria-label="Shuffle Tooltip">
        <IconButton
          aria-label="Shuffle"
          icon={<ShuffleIcon style={{ width: '20px', height: '20px' }} />}
          onClick={onConfirmationModalOpen}
          backgroundColor="transparent"
          _hover={{ backgroundColor: iconHoverBg }}
        />
      </Tooltip>

      <Tooltip label="Search" aria-label="Search Tooltip">
        <IconButton
          aria-label="Search"
          icon={<MagnifyingGlassIcon style={{ width: '23px', height: '23px' }} />}
          onClick={onSearchModalOpen}
          backgroundColor="transparent"
          _hover={{ backgroundColor: iconHoverBg }}
        />
      </Tooltip>

      <IconButton
        icon={
          colorMode === 'dark' ? (
            <SunIcon style={{ width: '20px', height: '20px' }} />
          ) : (
            <MoonIcon style={{ width: '20px', height: '20px' }} />
          )
        }
        onClick={toggleColorMode}
        aria-label="Toggle Dark Mode"
        backgroundColor={iconBg}
        _hover={{ backgroundColor: iconHoverBg }}
      />
    </Flex>
  );
};

export default DesktopMenu;