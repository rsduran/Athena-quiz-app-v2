import React from 'react';
import {
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Flex,
  Text,
  Stack,
  Select,
  Switch,
} from '@chakra-ui/react';
import {
  HamburgerMenuIcon,
  StarIcon,
  StarFilledIcon,
  ShuffleIcon,
  EyeOpenIcon,
  EyeNoneIcon,
  UpdateIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
} from '@radix-ui/react-icons';

interface MobileMenuProps {
  state?: {
    filteredQuestions?: any[];
    currentQuestionIndex?: number;
    isDrawerOpen?: boolean;
    selectedFilter?: string;
    favorites?: Set<number>;
    optionsShuffled?: boolean;
    eyeIcon?: string;
    colorMode?: string;
    iconHoverBg?: string;
  };
  actions?: {
    onDrawerOpen?: () => void;
    onDrawerClose?: () => void;
    handleDropdownChange?: (value: string) => void;
    handleToggleFavorites?: (id: number) => void;
    handleSubmit?: () => void;
    handleToggleShuffleOptions?: () => void;
    onConfirmationModalOpen?: () => void;
    toggleFlipCardVisibility?: () => void;
    onResetModalOpen?: () => void;
    onSearchModalOpen?: () => void;
    toggleColorMode?: () => void;
  };
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  state = {}, 
  actions = {}
}) => {
  const {
    filteredQuestions = [],
    currentQuestionIndex = 0,
    isDrawerOpen = false,
    selectedFilter = 'all',
    favorites = new Set(),
    optionsShuffled = false,
    eyeIcon = 'open',
    colorMode = 'light',
    iconHoverBg = '',
  } = state;

  const {
    onDrawerOpen = () => {},
    onDrawerClose = () => {},
    handleDropdownChange = () => {},
    handleToggleFavorites = () => {},
    handleSubmit = () => {},
    handleToggleShuffleOptions = () => {},
    onConfirmationModalOpen = () => {},
    toggleFlipCardVisibility = () => {},
    onResetModalOpen = () => {},
    onSearchModalOpen = () => {},
    toggleColorMode = () => {},
  } = actions;

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  return (
    <>
      <IconButton
        aria-label="Menu"
        icon={<HamburgerMenuIcon style={{ width: '20px', height: '20px' }} />}
        onClick={onDrawerOpen}
        backgroundColor="transparent"
        _hover={{ backgroundColor: iconHoverBg }}
      />
      <Drawer isOpen={isDrawerOpen} placement="right" onClose={onDrawerClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader p={0}>
            <Flex align="center" justify="space-between" p={4}>
              <Text fontSize="lg" fontWeight="bold">Menu</Text>
              <DrawerCloseButton position="static" />
            </Flex>
          </DrawerHeader>
          <DrawerBody>
            <Stack spacing={4}>
              <Select
                value={selectedFilter}
                onChange={(e) => handleDropdownChange(e.target.value)}
              >
                <option value="all">All Questions</option>
                <option value="favorites">Favorites</option>
                <option value="incorrect">Incorrect</option>
                <option value="answered">Answered</option>
                <option value="unanswered">Unanswered</option>
              </Select>

              <Button
                onClick={() => currentQuestion && handleToggleFavorites(currentQuestion.id)}
                leftIcon={
                  currentQuestion && favorites.has(currentQuestion.id) ? (
                    <StarFilledIcon style={{ width: '20px', height: '20px' }} />
                  ) : (
                    <StarIcon style={{ width: '20px', height: '20px' }} />
                  )
                }
                variant="ghost"
                fontWeight="bold"
                isDisabled={!currentQuestion}
              >
                {currentQuestion && favorites.has(currentQuestion.id)
                  ? 'Remove from Favorites'
                  : 'Add to Favorites'}
              </Button>

              <Button
                onClick={handleSubmit}
                variant="ghost"
                fontWeight="bold"
              >
                Submit
              </Button>

              <Flex alignItems="center" justifyContent="center">
                <Switch
                  isChecked={optionsShuffled}
                  onChange={handleToggleShuffleOptions}
                  size="lg"
                  colorScheme="teal"
                  mr={2}
                />
                <Text fontWeight="bold">Shuffle Choices</Text>
              </Flex>

              <Button
                onClick={onConfirmationModalOpen}
                leftIcon={<ShuffleIcon style={{ width: '20px', height: '20px' }} />}
                variant="ghost"
                fontWeight="bold"
              >
                Shuffle Questions
              </Button>

              <Button
                onClick={toggleFlipCardVisibility}
                leftIcon={
                  eyeIcon === 'open' ? (
                    <EyeOpenIcon style={{ width: '20px', height: '20px' }} />
                  ) : (
                    <EyeNoneIcon style={{ width: '20px', height: '20px' }} />
                  )
                }
                variant="ghost"
                fontWeight="bold"
              >
                {eyeIcon === 'open' ? 'Hide Flip Card' : 'Show Flip Card'}
              </Button>

              <Button
                onClick={onResetModalOpen}
                leftIcon={<UpdateIcon style={{ width: '20px', height: '20px' }} />}
                variant="ghost"
                fontWeight="bold"
              >
                Reset
              </Button>

              <Button
                onClick={onSearchModalOpen}
                leftIcon={<MagnifyingGlassIcon style={{ width: '23px', height: '23px' }} />}
                variant="ghost"
                fontWeight="bold"
              >
                Search
              </Button>

              <Button
                onClick={toggleColorMode}
                leftIcon={
                  colorMode === 'dark' ? (
                    <SunIcon style={{ width: '20px', height: '20px' }} />
                  ) : (
                    <MoonIcon style={{ width: '20px', height: '20px' }} />
                  )
                }
                variant="ghost"
                fontWeight="bold"
              >
                Toggle {colorMode === 'light' ? 'Dark' : 'Light'} Mode
              </Button>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MobileMenu;