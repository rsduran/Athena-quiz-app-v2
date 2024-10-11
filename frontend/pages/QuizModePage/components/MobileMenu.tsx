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
  state: any;
  actions: any;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ state, actions }) => {
  const currentQuestion = state.filteredQuestions[state.currentQuestionIndex];

  return (
    <>
      <IconButton
        aria-label="Menu"
        icon={<HamburgerMenuIcon style={{ width: '20px', height: '20px' }} />}
        onClick={actions.onDrawerOpen}
        backgroundColor="transparent"
        _hover={{ backgroundColor: state.iconHoverBg }}
      />
      <Drawer isOpen={state.isDrawerOpen} placement="right" onClose={actions.onDrawerClose}>
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
                value={state.selectedFilter}
                onChange={(e) => actions.handleDropdownChange(e.target.value)}
              >
                <option value="all">All Questions</option>
                <option value="favorites">Favorites</option>
                <option value="incorrect">Incorrect</option>
                <option value="answered">Answered</option>
                <option value="unanswered">Unanswered</option>
              </Select>

              <Button
                onClick={() => currentQuestion && actions.handleToggleFavorites(currentQuestion.id)}
                leftIcon={
                  currentQuestion && state.favorites.has(currentQuestion.id) ? (
                    <StarFilledIcon style={{ width: '20px', height: '20px' }} />
                  ) : (
                    <StarIcon style={{ width: '20px', height: '20px' }} />
                  )
                }
                variant="ghost"
                fontWeight="bold"
              >
                {currentQuestion && state.favorites.has(currentQuestion.id)
                  ? 'Remove from Favorites'
                  : 'Add to Favorites'}
              </Button>

              <Button
                onClick={actions.handleSubmit}
                variant="ghost"
                fontWeight="bold"
              >
                Submit
              </Button>

              <Flex alignItems="center" justifyContent="center">
                <Switch
                  isChecked={state.optionsShuffled}
                  onChange={actions.handleToggleShuffleOptions}
                  size="lg"
                  colorScheme="teal"
                  mr={2}
                />
                <Text fontWeight="bold">Shuffle Choices</Text>
              </Flex>

              <Button
                onClick={actions.onConfirmationModalOpen}
                leftIcon={<ShuffleIcon style={{ width: '20px', height: '20px' }} />}
                variant="ghost"
                fontWeight="bold"
              >
                Shuffle Questions
              </Button>

              <Button
                onClick={actions.toggleFlipCardVisibility}
                leftIcon={
                  state.eyeIcon === 'open' ? (
                    <EyeOpenIcon style={{ width: '20px', height: '20px' }} />
                  ) : (
                    <EyeNoneIcon style={{ width: '20px', height: '20px' }} />
                  )
                }
                variant="ghost"
                fontWeight="bold"
              >
                {state.eyeIcon === 'open' ? 'Hide Flip Card' : 'Show Flip Card'}
              </Button>

              <Button
                onClick={actions.onResetModalOpen}
                leftIcon={<UpdateIcon style={{ width: '20px', height: '20px' }} />}
                variant="ghost"
                fontWeight="bold"
              >
                Reset
              </Button>

              <Button
                onClick={actions.onSearchModalOpen}
                leftIcon={<MagnifyingGlassIcon style={{ width: '23px', height: '23px' }} />}
                variant="ghost"
                fontWeight="bold"
              >
                Search
              </Button>

              <Button
                onClick={actions.toggleColorMode}
                leftIcon={
                  state.colorMode === 'dark' ? (
                    <SunIcon style={{ width: '20px', height: '20px' }} />
                  ) : (
                    <MoonIcon style={{ width: '20px', height: '20px' }} />
                  )
                }
                variant="ghost"
                fontWeight="bold"
              >
                Toggle {state.colorMode === 'light' ? 'Dark' : 'Light'} Mode
              </Button>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MobileMenu;