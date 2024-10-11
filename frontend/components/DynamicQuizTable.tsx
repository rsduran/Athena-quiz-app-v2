// DynamicQuizTable.tsx

import React, { useState, useEffect, KeyboardEvent } from 'react';
import {
  Input,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link,
  Progress,
  Badge,
  Checkbox,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  IconButton,
  useDisclosure,
  Flex,
  Text,
  Stack,
  useBreakpointValue,
  useToast,
} from '@chakra-ui/react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';
import {
  OpenInNewWindowIcon,
  Pencil2Icon,
  TrashIcon,
  LockClosedIcon,
  LockOpen1Icon,
} from '@radix-ui/react-icons';
import UrlsModal from '../components/UrlsModal';
import { getBackendUrl } from '@/utils/getBackendUrl';

interface QuizSet {
  id: string;
  title: string;
  urls: string[];
  progress: number;
  score: number;
  total_questions: number;
  grade: string;
  status: string;
  lockState: boolean;
}

interface UrlGroups {
  [baseUrl: string]: {
    [prefix: string]: {
      start: string;
      end: string;
    };
  };
}

const DynamicQuizTable = () => {
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [hoveredTitleId, setHoveredTitleId] = useState<string | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deleteQuizSetId, setDeleteQuizSetId] = useState<string | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [isDeleteMultipleAlertOpen, setIsDeleteMultipleAlertOpen] = useState(false);
  const [isDeleteAllAlertOpen, setIsDeleteAllAlertOpen] = useState(false);
  const toast = useToast();
  const backendUrl = getBackendUrl();

  // Determine if we're on a mobile device
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Fetch quiz sets data
  const fetchQuizSets = async () => {
    try {
      const response = await fetch(`${backendUrl}/getQuizSets`);
      if (!response.ok) throw new Error('Network response was not ok');

      const quizSetsData = await response.json();
      const updatedQuizSets = await Promise.all(
        quizSetsData.map(async (quizSet: QuizSet) => {
          const detailsResponse = await fetch(`${backendUrl}/getQuizSetDetails/${quizSet.id}`);
          const details = await detailsResponse.json();

          const scoreResponse = await fetch(`${backendUrl}/getQuizSetScore/${quizSet.id}`);
          const scoreData = await scoreResponse.json();

          // Fetch lock state
          const lockStateResponse = await fetch(`${backendUrl}/getLockState/${quizSet.id}`);
          const lockStateData = await lockStateResponse.json();

          return {
            ...quizSet,
            urls: details.urls,
            progress: details.progress,
            score: scoreData.score,
            total_questions: scoreData.total_questions,
            grade: calculateGrade(scoreData.score, scoreData.total_questions),
            status: calculateStatus(scoreData.score, scoreData.total_questions),
            lockState: lockStateData.lock_state, // Set lock state
          };
        })
      );
      setQuizSets(updatedQuizSets);
    } catch (error) {
      console.error('Error fetching quiz sets:', error);
    }
  };

  useEffect(() => {
    // Load checked state from localStorage
    const savedCheckedItemsJSON = localStorage.getItem('checkedItems');
    const savedCheckedItems = savedCheckedItemsJSON ? JSON.parse(savedCheckedItemsJSON) : {};
    setCheckedItems(savedCheckedItems);

    // Fetch quiz sets
    fetchQuizSets();

    // Fetch the initial lock state from the backend
    const fetchLockState = async () => {
      try {
        const response = await fetch(`${backendUrl}/getLockState/global`); // Assuming 'global' as a key for global lock state
        const data = await response.json();
        setIsLocked(data.lock_state);
      } catch (error) {
        console.error('Error fetching lock state:', error);
      }
    };

    fetchLockState();
  }, []);

  const calculateGrade = (score: number, totalQuestions: number) => {
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    return percentage >= 70 ? 'Passed' : 'Failed';
  };

  const calculateStatus = (score: number, totalQuestions: number) => {
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    return percentage >= 70 ? 'passed' : 'failed';
  };

  const toggleLockState = async (quizSetId: string) => {
    // Function to toggle lock state
    try {
      const response = await fetch(`${backendUrl}/toggleLockState/${quizSetId}`, {
        method: 'POST',
      });
      if (response.ok) {
        setQuizSets(
          quizSets.map((quizSet) =>
            quizSet.id === quizSetId ? { ...quizSet, lockState: !quizSet.lockState } : quizSet
          )
        );
      }
    } catch (error) {
      console.error('Error toggling lock state:', error);
    }
  };

  const toggleLock = async () => {
    try {
      const response = await fetch(`${backendUrl}/toggleLockState/global`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setIsLocked(data.new_state); // Update the state based on the response
      }
    } catch (error) {
      console.error('Error toggling global lock state:', error);
    }
  };

  // Adjusted renderGradeComponent function
  const renderGradeComponent = (quizSet: QuizSet) => {
    const percentage =
      quizSet.total_questions > 0
        ? Math.round((quizSet.score / quizSet.total_questions) * 100)
        : 0;

    if (isLocked) {
      return <Text fontSize={['sm', 'md']}>Pending</Text>;
    }

    if (isMobile) {
      // Simplified grade display for mobile view
      return (
        <Text fontSize="sm">
          {quizSet.grade} ({percentage}%)
        </Text>
      );
    }

    // Desktop view with full Stat component
    const arrowType = quizSet.grade === 'Passed' ? 'increase' : 'decrease';

    return (
      <Stat>
        <StatLabel>{quizSet.grade}</StatLabel>
        <StatNumber>
          {quizSet.score}/{quizSet.total_questions}
        </StatNumber>
        <StatHelpText>
          <StatArrow type={arrowType} />
          {percentage}%
        </StatHelpText>
      </Stat>
    );
  };

  const renderBadge = (status: string, progress: number) => {
    if (progress === 0) {
      return <Badge colorScheme="purple">New</Badge>;
    } else if (isLocked) {
      return <Badge>In Progress</Badge>;
    }

    switch (status) {
      case 'passed':
        return <Badge colorScheme="green">Passed</Badge>;
      case 'failed':
        return <Badge colorScheme="red">Failed</Badge>;
      default:
        return null;
    }
  };

  const processUrlsForDisplay = (urls: string[]) => {
    const urlGroups: UrlGroups = {};
    urls.forEach((url: string) => {
      const match = url.match(/(.*\/)(\d+)$/);
      if (match) {
        const [, baseUrl, number] = match;
        const prefix = number.substring(0, 4);
        if (!urlGroups[baseUrl]) urlGroups[baseUrl] = {};
        if (!urlGroups[baseUrl][prefix])
          urlGroups[baseUrl][prefix] = { start: number, end: number };
        urlGroups[baseUrl][prefix].end = number;
      }
    });

    return Object.entries(urlGroups).flatMap(([baseUrl, groups]) => {
      return Object.values(groups).map(
        (group) => `${baseUrl}, ${group.start}, ${group.end}`
      );
    });
  };

  const handleOpenUrlsModal = (urls: string[]) => {
    const processedUrls = processUrlsForDisplay(urls);
    setSelectedUrls(processedUrls);
    onOpen();
  };

  const handleParentCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const newCheckedItems = quizSets.reduce<{ [key: string]: boolean }>((acc, quizSet) => {
      acc[quizSet.id] = isChecked;
      return acc;
    }, {});
    setCheckedItems(newCheckedItems);
    localStorage.setItem('checkedItems', JSON.stringify(newCheckedItems));
  };

  const handleChildCheckboxChange = (id: string, checked: boolean) => {
    const newCheckedItems = { ...checkedItems, [id]: checked };
    setCheckedItems(newCheckedItems);
    localStorage.setItem('checkedItems', JSON.stringify(newCheckedItems));
  };

  const allChecked =
    quizSets.length > 0 && quizSets.every((quizSet) => checkedItems[quizSet.id]);
  const isIndeterminate =
    quizSets.some((quizSet) => checkedItems[quizSet.id]) && !allChecked;

  // Function to handle the start of editing
  const handleEditStart = (quizSet: QuizSet) => {
    setEditingTitleId(quizSet.id);
    setEditingTitle(quizSet.title);
  };

  // Function to handle the change of the input field
  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTitle(event.target.value);
  };

  // Function to handle the renaming on 'Enter' key
  const handleRename = async (quizSetId: string, newTitle: string) => {
    try {
      const response = await fetch(`${backendUrl}/renameQuizSet/${quizSetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_title: newTitle }),
      });
      if (response.ok) {
        setQuizSets(
          quizSets.map((qs) =>
            qs.id === quizSetId ? { ...qs, title: newTitle } : qs
          )
        );
      }
      // Reset the editing state
      setEditingTitleId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Error renaming quiz set:', error);
    }
  };

  // Function to handle key press events for the input field
  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>, quizSetId: string) => {
    if (event.key === 'Enter') {
      handleRename(quizSetId, editingTitle);
    }
  };

  // Function to open delete confirmation dialog
  const onOpenDeleteAlert = (quizSetId: string) => {
    setDeleteQuizSetId(quizSetId);
    setIsDeleteAlertOpen(true);
  };

  // Function to handle quiz set deletion
  const handleDeleteQuizSet = async () => {
    if (deleteQuizSetId) {
      try {
        const response = await fetch(`${backendUrl}/deleteQuizSet/${deleteQuizSetId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setQuizSets(quizSets.filter((qs) => qs.id !== deleteQuizSetId));
          setIsDeleteAlertOpen(false);
          setDeleteQuizSetId(null);
        }
      } catch (error) {
        console.error('Error deleting quiz set:', error);
      }
    }
  };

  const handleDeleteMultipleQuizSets = async () => {
    const selectedQuizSetIds = Object.keys(checkedItems).filter(id => checkedItems[id]);
    if (selectedQuizSetIds.length === 0) {
      toast({
        title: "No quiz sets selected",
        description: "Please select at least one quiz set to delete.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/deleteMultipleQuizSets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizSetIds: selectedQuizSetIds }),
      });
      if (response.ok) {
        setQuizSets(quizSets.filter(qs => !selectedQuizSetIds.includes(qs.id)));
        setCheckedItems({});
        toast({
          title: "Quiz sets deleted",
          description: `${selectedQuizSetIds.length} quiz sets have been deleted successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to delete quiz sets');
      }
    } catch (error) {
      console.error('Error deleting multiple quiz sets:', error);
      toast({
        title: "Error",
        description: "Failed to delete quiz sets. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setIsDeleteMultipleAlertOpen(false);
  };

  const handleDeleteAllQuizSets = async () => {
    try {
      const response = await fetch(`${backendUrl}/deleteAllQuizSets`, {
        method: 'POST',
      });
      if (response.ok) {
        setQuizSets([]);
        setCheckedItems({});
        toast({
          title: "All quiz sets deleted",
          description: "All quiz sets have been deleted successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to delete all quiz sets');
      }
    } catch (error) {
      console.error('Error deleting all quiz sets:', error);
      toast({
        title: "Error",
        description: "Failed to delete all quiz sets. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setIsDeleteAllAlertOpen(false);
  };

  return (
    <Box
      width={['95%', '90%', '80%']}
      mx="auto"
      mt={5}
      border="1px"
      borderColor={borderColor}
      borderRadius="md"
      overflow="hidden"
    >
      {quizSets.length === 0 ? (
        // Display message when no quiz sets are available
        <Box p={4} textAlign="center">
          <Text fontSize="xl" fontWeight="bold">No quiz sets available.</Text>
          <Text mt={2}>Please add a new quiz set to get started.</Text>
        </Box>
      ) : (
        <>
          {/* Added Buttons for Delete Selected and Delete All */}
          <Flex justifyContent="space-between" p={4}>
            <Button
              colorScheme="red"
              onClick={() => setIsDeleteMultipleAlertOpen(true)}
              isDisabled={!Object.values(checkedItems).some(Boolean)}
            >
              Delete Selected
            </Button>
            <Button colorScheme="red" onClick={() => setIsDeleteAllAlertOpen(true)}>
              Delete All
            </Button>
          </Flex>
  
          {isMobile ? (
            // Mobile View: Card Layout
            <Stack spacing={4} p={4}>
              {quizSets.map((quizSet) => (
                <Box
                  key={quizSet.id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  boxShadow="sm"
                  bg={checkedItems[quizSet.id]
                    ? useColorModeValue('gray.100', 'gray.700')
                    : 'inherit'}
                >
                  <Flex justifyContent="space-between" alignItems="center">
                    <Checkbox
                      isChecked={checkedItems[quizSet.id]}
                      onChange={(e) =>
                        handleChildCheckboxChange(quizSet.id, e.target.checked)
                      }
                    />
                    <Flex>
                      <IconButton
                        aria-label={isLocked ? 'Unlock Grades' : 'Lock Grades'}
                        icon={isLocked ? <LockClosedIcon /> : <LockOpen1Icon />}
                        onClick={toggleLock}
                        bg="transparent"
                        _hover={{ color: 'blue.500' }}
                        size="sm"
                        mr={2}
                      />
                      <IconButton
                        aria-label="Delete quiz set"
                        icon={<TrashIcon style={{ width: '20px', height: '20px' }} />}
                        onClick={() => onOpenDeleteAlert(quizSet.id)}
                        bg="transparent"
                        _hover={{ color: 'blue.500' }}
                        size="sm"
                      />
                    </Flex>
                  </Flex>
                  <Flex
                    mt={2}
                    alignItems="center"
                    justifyContent="space-between"
                    onMouseEnter={() => setHoveredTitleId(quizSet.id)}
                    onMouseLeave={() => setHoveredTitleId(null)}
                  >
                    {editingTitleId === quizSet.id ? (
                      <Input
                        value={editingTitle}
                        onChange={handleEditChange}
                        onBlur={() => handleRename(quizSet.id, editingTitle)}
                        onKeyDown={(e) => handleKeyPress(e, quizSet.id)}
                        autoFocus
                        size="sm"
                        maxW="150px"
                      />
                    ) : (
                      <Flex alignItems="center">
                        <Link href={`/QuizModePage/${quizSet.id}`} isExternal fontSize="md">
                          {quizSet.title}
                        </Link>
                        {hoveredTitleId === quizSet.id && (
                          <IconButton
                            aria-label="Edit title"
                            icon={<Pencil2Icon style={{ width: '18px', height: '18px' }} />}
                            onClick={() => handleEditStart(quizSet)}
                            bg="transparent"
                            _hover={{ color: 'blue.500' }}
                            size="sm"
                            ml={2}
                          />
                        )}
                      </Flex>
                    )}
                  </Flex>
  
                  {/* Progress Section */}
                  <Flex mt={2} alignItems="center">
                    <Text fontWeight="bold" mr={2} fontSize="sm">
                      Progress:
                    </Text>
                    <Box flex="1">
                      <Progress value={quizSet.progress} size="sm" colorScheme="teal" />
                    </Box>
                    <Text fontSize="sm" ml={2}>{quizSet.progress}%</Text>
                  </Flex>
  
                  {/* Grade Section */}
                  <Flex mt={2} alignItems="center">
                    <Text fontWeight="bold" mr={2} fontSize="sm">Grade:</Text>
                    {renderGradeComponent(quizSet)}
                  </Flex>
  
                  {/* Status Section */}
                  <Flex mt={2} alignItems="center">
                    <Text fontWeight="bold" mr={2} fontSize="sm">Status:</Text>
                    {renderBadge(quizSet.status, quizSet.progress)}
                  </Flex>
  
                  {/* URLs Section */}
                  <Flex mt={2} alignItems="center">
                    <Text fontWeight="bold" mr={2} fontSize="sm">URLs:</Text>
                    <IconButton
                      aria-label="View URLs"
                      icon={<OpenInNewWindowIcon style={{ width: '20px', height: '20px' }} />}
                      onClick={() => handleOpenUrlsModal(quizSet.urls)}
                      bg="transparent"
                      _hover={{ color: 'blue.500' }}
                      size="sm"
                    />
                  </Flex>
                </Box>
              ))}
            </Stack>
          ) : (
            // Desktop View: Table Layout
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>
                    <Checkbox
                      isChecked={allChecked}
                      isIndeterminate={isIndeterminate}
                      onChange={handleParentCheckboxChange}
                    />
                  </Th>
                  <Th textAlign="center">Quiz Set</Th>
                  <Th textAlign="center">URLs</Th>
                  <Th textAlign="center">Progress</Th>
                  <Th textAlign="center">Grade</Th>
                  <Th textAlign="center">Status</Th>
                  <Th textAlign="center">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {quizSets.map((quizSet) => (
                  <Tr
                    key={quizSet.id}
                    bg={checkedItems[quizSet.id]
                      ? useColorModeValue('gray.100', 'gray.600')
                      : 'transparent'}
                  >
                    <Td>
                      <Checkbox
                        isChecked={checkedItems[quizSet.id]}
                        onChange={(e) =>
                          handleChildCheckboxChange(quizSet.id, e.target.checked)
                        }
                      />
                    </Td>
                    <Td
                      onMouseEnter={() => setHoveredTitleId(quizSet.id)}
                      onMouseLeave={() => setHoveredTitleId(null)}
                    >
                      {editingTitleId === quizSet.id ? (
                        <Input
                          value={editingTitle}
                          onChange={handleEditChange}
                          onBlur={() => handleRename(quizSet.id, editingTitle)}
                          onKeyDown={(e) => handleKeyPress(e, quizSet.id)}
                          autoFocus
                          size="sm"
                          maxW="150px"
                        />
                      ) : (
                        <Flex alignItems="center" justifyContent="center">
                          <Link href={`/QuizModePage/${quizSet.id}`} isExternal textAlign="center">
                            {quizSet.title}
                          </Link>
                          {hoveredTitleId === quizSet.id && (
                            <IconButton
                              aria-label="Edit title"
                              icon={<Pencil2Icon style={{ width: '18px', height: '18px' }} />}
                              onClick={() => handleEditStart(quizSet)}
                              bg="transparent"
                              _hover={{ color: 'blue.500' }}
                              size="sm"
                              ml={2}
                            />
                          )}
                        </Flex>
                      )}
                    </Td>
                    <Td textAlign="center">
                      <IconButton
                        aria-label="View URLs"
                        icon={<OpenInNewWindowIcon style={{ width: '20px', height: '20px' }} />}
                        onClick={() => handleOpenUrlsModal(quizSet.urls)}
                        bg="transparent"
                        _hover={{ color: 'blue.500' }}
                        size="sm"
                      />
                    </Td>
                    <Td textAlign="center">
                      <Progress value={quizSet.progress} size="sm" colorScheme="teal" width="80%" mx="auto" />
                      <Text fontSize="sm" mt={1}>{quizSet.progress}%</Text>
                    </Td>
                    <Td textAlign="center">{renderGradeComponent(quizSet)}</Td>
                    <Td textAlign="center">
                      {renderBadge(quizSet.status, quizSet.progress)}
                    </Td>
                    <Td textAlign="center">
                      <Flex alignItems="center" justifyContent="center">
                        <IconButton
                          aria-label={isLocked ? 'Unlock Grades' : 'Lock Grades'}
                          icon={isLocked ? <LockClosedIcon /> : <LockOpen1Icon />}
                          onClick={toggleLock}
                          bg="transparent"
                          _hover={{ color: 'blue.500' }}
                          size="sm"
                          mr={2}
                        />
                        <IconButton
                          aria-label="Delete quiz set"
                          icon={<TrashIcon style={{ width: '20px', height: '20px' }} />}
                          onClick={() => onOpenDeleteAlert(quizSet.id)}
                          bg="transparent"
                          _hover={{ color: 'blue.500' }}
                          size="sm"
                        />
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </>
      )}
  
      {/* Modals and Dialogs */}
      <UrlsModal isOpen={isOpen} onClose={onClose} urls={selectedUrls} />
  
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Quiz Set
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
                No
              </Button>
              <Button colorScheme="red" onClick={handleDeleteQuizSet} ml={3}>
                Yes
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
  
      {/* Delete Multiple Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteMultipleAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteMultipleAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Selected Quiz Sets
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteMultipleAlertOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteMultipleQuizSets} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
  
      {/* Delete All Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteAllAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAllAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete All Quiz Sets
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete all quiz sets? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteAllAlertOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteAllQuizSets} ml={3}>
                Delete All
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default DynamicQuizTable;
