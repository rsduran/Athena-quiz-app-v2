import React, { useState, useEffect, KeyboardEvent } from 'react';
import {
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
  Spinner,
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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Input,
} from '@chakra-ui/react';
import {
  OpenInNewWindowIcon,
  Pencil2Icon,
  TrashIcon,
} from '@radix-ui/react-icons';
import UrlsModal from '../components/UrlsModal';
import { getBackendUrl } from '@/utils/getBackendUrl';
import { QuizSet } from '@/utils/types';

const DynamicQuizTable = () => {
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [selectedRawUrls, setSelectedRawUrls] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [hoveredTitleId, setHoveredTitleId] = useState<string | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deleteQuizSetId, setDeleteQuizSetId] = useState<string | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [isDeleteMultipleAlertOpen, setIsDeleteMultipleAlertOpen] = useState(false);
  const [isDeleteAllAlertOpen, setIsDeleteAllAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUrlsModalOpen, setIsUrlsModalOpen] = useState(false);
  const toast = useToast();
  const backendUrl = getBackendUrl();
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const savedCheckedItemsJSON = localStorage.getItem('checkedItems');
    const savedCheckedItems = savedCheckedItemsJSON ? JSON.parse(savedCheckedItemsJSON) : {};
    setCheckedItems(savedCheckedItems);
    fetchQuizSets();
  }, []);

  useEffect(() => {
    // Synchronize checkedItems with current quizSets
    const validQuizSetIds = new Set(quizSets.map((qs) => qs.id));
    const newCheckedItems = Object.fromEntries(
      Object.entries(checkedItems).filter(([id]) => validQuizSetIds.has(id))
    );
    setCheckedItems(newCheckedItems);
    localStorage.setItem('checkedItems', JSON.stringify(newCheckedItems));
  }, [quizSets]);

  const fetchQuizSets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${backendUrl}/getQuizSets`);
      if (!response.ok) throw new Error('Network response was not ok');
      const quizSetsData: QuizSet[] = await response.json();
      setQuizSets(quizSetsData);
    } catch (error) {
      console.error('Error fetching quiz sets:', error);
    } finally {
      setIsLoading(false);
    }
  };  

  const calculateGrade = (score: number, totalQuestions: number): string => {
    if (totalQuestions === 0) return 'N/A';
    const percentage = Math.round((score / totalQuestions) * 100);
    if (percentage >= 70) return 'Pass';
    return 'Fail';
  };

  const renderGradeBadge = (score: number, totalQuestions: number) => {
    if (totalQuestions === 0) return <Badge>Not Started</Badge>;
    const percentage = Math.round((score / totalQuestions) * 100);
    if (percentage >= 70) return <Badge colorScheme="green">PASS</Badge>;
    return <Badge colorScheme="red">FAIL</Badge>;
  };

  const renderGradeComponent = (quizSet: QuizSet) => {
    if (quizSet.attempts === 0 || quizSet.latest_score === null) {
      return <Text textAlign="center">Not attempted</Text>;
    }
  
    const percentage = quizSet.total_questions > 0 ? Math.round((quizSet.latest_score / quizSet.total_questions) * 100) : 0;
    const gradeBadge = renderGradeBadge(quizSet.latest_score, quizSet.total_questions);
  
    return (
      <Stat textAlign="center">
        {gradeBadge}
        <StatNumber>{quizSet.latest_score}/{quizSet.total_questions}</StatNumber>
        <StatHelpText>{percentage}%</StatHelpText>
      </Stat>
    );
  };  

  const renderProgressBadge = (progress: number, finished: boolean) => {
    if (finished) return <Badge colorScheme="green">Finished</Badge>;
    if (progress === 0) return <Badge colorScheme="gray">Not Started</Badge>;
    else return <Badge colorScheme="yellow">In Progress</Badge>;
  };  

  const handleOpenUrlsModal = async (quizSetId: string) => {
    console.log(`Fetching raw URLs for quizSetId: ${quizSetId}`);
    try {
      const response = await fetch(`${backendUrl}/getRawUrls/${quizSetId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setSelectedRawUrls(data.rawUrls);
      setIsUrlsModalOpen(true);
    } catch (error) {
      console.error('Error fetching raw URLs:', error);
    }
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

  const handleEditStart = (quizSet: QuizSet) => {
    setEditingTitleId(quizSet.id);
    setEditingTitle(quizSet.title || '');
  };

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTitle(event.target.value);
  };

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
      setEditingTitleId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Error renaming quiz set:', error);
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>, quizSetId: string) => {
    if (event.key === 'Enter') {
      handleRename(quizSetId, editingTitle);
    }
  };

  const onOpenDeleteAlert = (quizSetId: string) => {
    setDeleteQuizSetId(quizSetId);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteQuizSet = async () => {
    if (deleteQuizSetId) {
      try {
        const response = await fetch(`${backendUrl}/deleteQuizSet/${deleteQuizSetId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setQuizSets(quizSets.filter((qs) => qs.id !== deleteQuizSetId));
          const updatedCheckedItems = { ...checkedItems };
          delete updatedCheckedItems[deleteQuizSetId];
          setCheckedItems(updatedCheckedItems);
          localStorage.setItem('checkedItems', JSON.stringify(updatedCheckedItems));
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
        const updatedCheckedItems = { ...checkedItems };
        selectedQuizSetIds.forEach(id => delete updatedCheckedItems[id]);
        setCheckedItems(updatedCheckedItems);
        localStorage.setItem('checkedItems', JSON.stringify(updatedCheckedItems));
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
        localStorage.removeItem('checkedItems');
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

  const allChecked = quizSets.length > 0 && quizSets.every((quizSet) => checkedItems[quizSet.id]);
  const isIndeterminate = quizSets.some((quizSet) => checkedItems[quizSet.id]) && !allChecked;

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
      {isLoading ? (
        <Flex justify="center" align="center" p={4}>
          <Spinner size="xl" />
        </Flex>
      ) : quizSets.length === 0 ? (
        <Box p={4} textAlign="center">
          <Text fontSize="xl" fontWeight="bold">No quiz sets available.</Text>
          <Text mt={2}>Please add a new quiz set to get started.</Text>
        </Box>
      ) : (
        <>
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

          <Table variant="simple">
            <Thead>
              <Tr>
                <Th textAlign="center">
                  <Checkbox
                    isChecked={allChecked}
                    isIndeterminate={isIndeterminate}
                    onChange={handleParentCheckboxChange}
                  />
                </Th>
                <Th textAlign="center">Quiz Set</Th>
                <Th textAlign="center">Progress</Th>
                <Th textAlign="center">Attempts</Th>
                <Th textAlign="center">Latest Grade</Th>
                <Th textAlign="center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {quizSets.map((quizSet) => (
                <Tr key={quizSet.id}>
                  <Td textAlign="center">
                    <Checkbox
                      isChecked={checkedItems[quizSet.id]}
                      onChange={(e) => handleChildCheckboxChange(quizSet.id, e.target.checked)}
                    />
                  </Td>
                  <Td textAlign="center">
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
                      <Link href={`/QuizModePage/${quizSet.id}`} isExternal textAlign="center">
                        {quizSet.title}
                      </Link>
                    )}
                  </Td>
                  <Td>
                    <Flex direction="column" alignItems="center">
                      {renderProgressBadge(quizSet.progress, quizSet.finished)}
                      <Box position="relative" width="80%" mt={1}>
                        <Progress
                          value={quizSet.finished ? 100 : quizSet.progress}
                          size="md"
                          colorScheme="teal"
                        />
                        <Text
                          position="absolute"
                          top="50%"
                          left="50%"
                          transform="translate(-50%, -50%)"
                          fontSize="10px"
                        >
                          {quizSet.finished ? '100%' : `${quizSet.progress}%`}
                        </Text>
                      </Box>
                      <Text fontSize="sm" mt={1}>
                        {quizSet.unanswered_questions} unanswered q's
                      </Text>
                    </Flex>
                  </Td>
                  <Td textAlign="center">
                    <Text>Attempt No. {quizSet.attempts}</Text>
                    <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
                      Avg. Score: {quizSet.average_score !== undefined && quizSet.average_score !== null && quizSet.total_questions > 0
                        ? `${quizSet.average_score.toFixed(2)} (${((quizSet.average_score / quizSet.total_questions) * 100).toFixed(2)}%)`
                        : 'N/A'}
                    </Text>
                  </Td>
                  <Td>{renderGradeComponent(quizSet)}</Td>
                  <Td textAlign="center">
                    <IconButton
                      aria-label="View URLs"
                      icon={<OpenInNewWindowIcon style={{ width: '18px', height: '18px' }} />}
                      onClick={() => handleOpenUrlsModal(quizSet.id)}
                      bg="transparent"
                      _hover={{ color: 'blue.500' }}
                      size="sm"
                    />
                    <IconButton
                      aria-label="Edit title"
                      icon={<Pencil2Icon style={{ width: '18px', height: '18px' }} />}
                      onClick={() => handleEditStart(quizSet)}
                      bg="transparent"
                      _hover={{ color: 'blue.500' }}
                      size="sm"
                      ml={2}
                    />
                    <IconButton
                      aria-label="Delete quiz set"
                      icon={<TrashIcon style={{ width: '18px', height: '18px' }} />}
                      onClick={() => onOpenDeleteAlert(quizSet.id)}
                      bg="transparent"
                      _hover={{ color: 'blue.500' }}
                      size="sm"
                      ml={2}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}

      <UrlsModal
        isOpen={isUrlsModalOpen}
        onClose={() => setIsUrlsModalOpen(false)}
        rawUrls={selectedRawUrls}
      />

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
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteQuizSet} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

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