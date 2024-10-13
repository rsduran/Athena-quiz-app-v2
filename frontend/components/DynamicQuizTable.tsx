import React, { useState, useEffect, useCallback, useRef, KeyboardEvent, useMemo } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  VStack,
  HStack,
} from '@chakra-ui/react';
import {
  ExternalLinkIcon,
  EditIcon,
  DeleteIcon,
} from '@chakra-ui/icons';
import { GoKebabHorizontal, GoSortAsc, GoSortDesc } from 'react-icons/go';
import UrlsModal from '../components/UrlsModal';
import { getBackendUrl } from '@/utils/getBackendUrl';
import { QuizSet } from '@/utils/types';
import QuizTableSkeleton from './QuizTableSkeleton';

const DynamicQuizTable: React.FC = () => {
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [selectedRawUrls, setSelectedRawUrls] = useState<string>('');
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [deleteQuizSetId, setDeleteQuizSetId] = useState<string | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState<boolean>(false);
  const [isDeleteMultipleAlertOpen, setIsDeleteMultipleAlertOpen] = useState<boolean>(false);
  const [isDeleteAllAlertOpen, setIsDeleteAllAlertOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUrlsModalOpen, setIsUrlsModalOpen] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [quizSetCount, setQuizSetCount] = useState<number>(0);

  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();
  const backendUrl = getBackendUrl();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchQuizSets();
    fetchSortOrder();
  }, []);

  useEffect(() => {
    const savedCheckedItemsJSON = localStorage.getItem('checkedItems');
    const savedCheckedItems = savedCheckedItemsJSON ? JSON.parse(savedCheckedItemsJSON) : {};
    setCheckedItems(savedCheckedItems);
    fetchQuizSets();
  }, []);

  useEffect(() => {
    const validQuizSetIds = new Set(quizSets.map((quizSet) => quizSet.id));
    const newCheckedItems = Object.fromEntries(
      Object.entries(checkedItems).filter(([id]) => validQuizSetIds.has(id))
    );
    setCheckedItems(newCheckedItems);
    localStorage.setItem('checkedItems', JSON.stringify(newCheckedItems));
  }, [quizSets, checkedItems]);

  const fetchSortOrder = useCallback(async () => {
    try {
      const response = await fetch(`${backendUrl}/getSortOrder`);
      if (response.ok) {
        const data = await response.json();
        setSortOrder(data.sortOrder);
      }
    } catch (error) {
      console.error('Error fetching sort order:', error);
    }
  }, [backendUrl]);

  const fetchQuizSets = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${backendUrl}/getQuizSets`);
      if (!response.ok) throw new Error('Network response was not ok');
      const quizSetsData: QuizSet[] = await response.json();
      setQuizSetCount(quizSetsData.length);

      await new Promise(resolve => setTimeout(resolve, 500));

      setQuizSets(quizSetsData);
    } catch (error) {
      console.error('Error fetching quiz sets:', error);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl]);

  const handleOpenUrlsModal = useCallback(async (quizSetId: string) => {
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
  }, [backendUrl]);

  const handleParentCheckboxChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    const newCheckedItems = quizSets.reduce<{ [key: string]: boolean }>((accumulator, quizSet) => {
      accumulator[quizSet.id] = isChecked;
      return accumulator;
    }, {});
    setCheckedItems(newCheckedItems);
    localStorage.setItem('checkedItems', JSON.stringify(newCheckedItems));
  }, [quizSets]);

  const handleChildCheckboxChange = useCallback((id: string, checked: boolean) => {
    setCheckedItems(prevItems => {
      const newCheckedItems = { ...prevItems, [id]: checked };
      localStorage.setItem('checkedItems', JSON.stringify(newCheckedItems));
      return newCheckedItems;
    });
  }, []);

  const handleEditStart = useCallback((quizSet: QuizSet) => {
    setEditingTitleId(quizSet.id);
    setEditingTitle(quizSet.title || '');
  }, []);

  const handleEditChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTitle(event.target.value);
  }, []);

  const handleRename = useCallback(async (quizSetId: string, newTitle: string) => {
    try {
      const response = await fetch(`${backendUrl}/renameQuizSet/${quizSetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_title: newTitle }),
      });
      if (response.ok) {
        setQuizSets(prevQuizSets =>
          prevQuizSets.map((quizSet) =>
            quizSet.id === quizSetId ? { ...quizSet, title: newTitle } : quizSet
          )
        );
      }
      setEditingTitleId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Error renaming quiz set:', error);
    }
  }, [backendUrl]);

  const handleKeyPress = useCallback((event: KeyboardEvent<HTMLInputElement>, quizSetId: string) => {
    if (event.key === 'Enter') {
      handleRename(quizSetId, editingTitle);
    }
  }, [handleRename, editingTitle]);

  const onOpenDeleteAlert = useCallback((quizSetId: string) => {
    setDeleteQuizSetId(quizSetId);
    setIsDeleteAlertOpen(true);
  }, []);

  const handleDeleteQuizSet = useCallback(async () => {
    if (deleteQuizSetId) {
      try {
        const response = await fetch(`${backendUrl}/deleteQuizSet/${deleteQuizSetId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setQuizSets(prevQuizSets => prevQuizSets.filter((quizSet) => quizSet.id !== deleteQuizSetId));
          setCheckedItems(prevItems => {
            const updatedCheckedItems = { ...prevItems };
            delete updatedCheckedItems[deleteQuizSetId];
            localStorage.setItem('checkedItems', JSON.stringify(updatedCheckedItems));
            return updatedCheckedItems;
          });
          setIsDeleteAlertOpen(false);
          setDeleteQuizSetId(null);
        }
      } catch (error) {
        console.error('Error deleting quiz set:', error);
      }
    }
  }, [backendUrl, deleteQuizSetId]);

  const handleDeleteMultipleQuizSets = useCallback(async () => {
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
        setQuizSets(prevQuizSets => prevQuizSets.filter(quizSet => !selectedQuizSetIds.includes(quizSet.id)));
        setCheckedItems(prevItems => {
          const updatedCheckedItems = { ...prevItems };
          selectedQuizSetIds.forEach(id => delete updatedCheckedItems[id]);
          localStorage.setItem('checkedItems', JSON.stringify(updatedCheckedItems));
          return updatedCheckedItems;
        });
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
  }, [backendUrl, checkedItems, toast]);

  const handleDeleteAllQuizSets = useCallback(async () => {
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
  }, [backendUrl, toast]);

  const toggleSortOrder = useCallback(async () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    try {
      const response = await fetch(`${backendUrl}/updateSortOrder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: newSortOrder }),
      });
      if (response.ok) {
        setSortOrder(newSortOrder);
      }
    } catch (error) {
      console.error('Error updating sort order:', error);
    }
  }, [backendUrl, sortOrder]);

  const calculateGrade = useCallback((score: number, totalQuestions: number): string => {
    if (totalQuestions === 0) return 'N/A';
    const percentage = Math.round((score / totalQuestions) * 100);
    if (percentage >= 70) return 'Pass';
    return 'Fail';
  }, []);

  const renderGradeBadge = useCallback((score: number, totalQuestions: number) => {
    if (totalQuestions === 0) return <Badge>Not Started</Badge>;
    const percentage = Math.round((score / totalQuestions) * 100);
    if (percentage >= 70) return <Badge colorScheme="green">PASS</Badge>;
    return <Badge colorScheme="red">FAIL</Badge>;
  }, []);

  const renderGradeComponent = useCallback((quizSet: QuizSet) => {
    if (quizSet.attempts === 0 || quizSet.latest_score === null) {
      return <Text textAlign="center" fontSize="sm">Not attempted</Text>;
    }

    const percentage = quizSet.total_questions > 0 ? Math.round((quizSet.latest_score / quizSet.total_questions) * 100) : 0;
    const gradeBadge = renderGradeBadge(quizSet.latest_score, quizSet.total_questions);

    return (
      <Stat textAlign="center">
        {gradeBadge}
        <StatNumber fontSize="sm">{quizSet.latest_score}/{quizSet.total_questions}</StatNumber>
        <StatHelpText fontSize="xs">{percentage}%</StatHelpText>
      </Stat>
    );
  }, [renderGradeBadge]);

  const renderProgressBadge = useCallback((progress: number, finished: boolean) => {
    if (finished) return <Badge colorScheme="green">Finished</Badge>;
    if (progress === 0) return <Badge colorScheme="gray">Not Started</Badge>;
    else return <Badge colorScheme="yellow">In Progress</Badge>;
  }, []);

  const formatRelativeTime = useCallback((dateString: string) => {
    try {
      const date = toZonedTime(parseISO(dateString), 'Asia/Manila');
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return 'Unknown';
    }
  }, []);

  const sortedQuizSets = useMemo(() => {
    return [...quizSets].sort((a, b) => {
      if (sortOrder === 'desc') {
        return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
      } else {
        return new Date(a.last_updated).getTime() - new Date(b.last_updated).getTime();
      }
    });
  }, [quizSets, sortOrder]);

  const allChecked = useMemo(() =>
    quizSets.length > 0 && quizSets.every((quizSet) => checkedItems[quizSet.id]),
    [quizSets, checkedItems]
  );

  const isIndeterminate = useMemo(() =>
    quizSets.some((quizSet) => checkedItems[quizSet.id]) && !allChecked,
    [quizSets, checkedItems, allChecked]
  );

  const renderQuizSetRow = useCallback((quizSet: QuizSet) => (
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
            maxWidth="150px"
          />
        ) : (
          <Link href={`/QuizModePage/${quizSet.id}`} isExternal textAlign="center">
            {quizSet.title}
          </Link>
        )}
      </Td>
      <Td textAlign="center">
        <Text>Attempt No. {quizSet.attempts}</Text>
        <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
          Avg. Score: {quizSet.average_score !== undefined && quizSet.average_score !== null && quizSet.total_questions > 0
            ? `${quizSet.average_score.toFixed(2)} (${((quizSet.average_score / quizSet.total_questions) * 100).toFixed(2)}%)`
            : 'N/A'}
        </Text>
      </Td>
      <Td>
        <Flex direction="column" alignItems="center">
          {renderProgressBadge(quizSet.progress, quizSet.finished)}
          <Box position="relative" width="80%" marginTop={1}>
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
          <Text fontSize="sm" marginTop={1}>
            {quizSet.unanswered_questions} unanswered q's
          </Text>
        </Flex>
      </Td>
      <Td>{renderGradeComponent(quizSet)}</Td>
      <Td textAlign="center">
        <Text fontSize="sm">{formatRelativeTime(quizSet.last_updated)}</Text>
      </Td>
      <Td>
        <Flex justifyContent="center">
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<GoKebabHorizontal />}
              variant="ghost"
              size="sm"
              _hover={{ backgroundColor: useColorModeValue('gray.100', 'gray.700') }}
            />
            <MenuList>
              <MenuItem
                icon={<ExternalLinkIcon boxSize={4} />}
                onClick={() => handleOpenUrlsModal(quizSet.id)}
              >
                Show URLs
              </MenuItem>
              <MenuItem
                icon={<EditIcon boxSize={4} />}
                onClick={() => handleEditStart(quizSet)}
              >
                Edit Quiz Title
              </MenuItem>
              <MenuItem
                icon={<DeleteIcon boxSize={4} />}
                onClick={() => onOpenDeleteAlert(quizSet.id)}
              >
                Delete Quiz Set
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Td>
    </Tr>
  ), [
    checkedItems,
    editingTitleId,
    editingTitle,
    handleChildCheckboxChange,
    handleEditChange,
    handleRename,
    handleKeyPress,
    renderProgressBadge,
    renderGradeComponent,
    formatRelativeTime,
    handleOpenUrlsModal,
    handleEditStart,
    onOpenDeleteAlert,
    useColorModeValue
  ]);

  const renderMobileCard = useCallback((quizSet: QuizSet) => (
    <Box
      key={quizSet.id}
      borderWidth="1px"
      borderRadius="lg"
      padding={4}
      marginBottom={4}
      backgroundColor={checkedItems[quizSet.id] ? useColorModeValue('gray.100', 'gray.700') : 'inherit'}
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <Checkbox
            isChecked={checkedItems[quizSet.id]}
            onChange={(e) => handleChildCheckboxChange(quizSet.id, e.target.checked)}
          />
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<GoKebabHorizontal />}
              variant="ghost"
              size="sm"
            />
            <MenuList>
              <MenuItem
                icon={<ExternalLinkIcon />}
                onClick={() => handleOpenUrlsModal(quizSet.id)}
              >
                Show URLs
              </MenuItem>
              <MenuItem
                icon={<EditIcon />}
                onClick={() => handleEditStart(quizSet)}
              >
                Edit Quiz Title
              </MenuItem>
              <MenuItem
                icon={<DeleteIcon />}
                onClick={() => onOpenDeleteAlert(quizSet.id)}
              >
                Delete Quiz Set
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
  
        <Box>
          {editingTitleId === quizSet.id ? (
            <Input
              value={editingTitle}
              onChange={handleEditChange}
              onBlur={() => handleRename(quizSet.id, editingTitle)}
              onKeyDown={(e) => handleKeyPress(e, quizSet.id)}
              autoFocus
              size="sm"
            />
          ) : (
            <Link href={`/QuizModePage/${quizSet.id}`} isExternal fontWeight="bold">
              {quizSet.title}
            </Link>
          )}
        </Box>
  
        <HStack justify="space-between">
          <Text fontSize="sm">Attempt No. {quizSet.attempts}</Text>
          <Text fontSize="sm">
            Avg. Score: {quizSet.average_score !== undefined && quizSet.average_score !== null && quizSet.total_questions > 0
              ? `${quizSet.average_score.toFixed(2)} (${((quizSet.average_score / quizSet.total_questions) * 100).toFixed(2)}%)`
              : 'N/A'}
          </Text>
        </HStack>
  
        <Box>
          <HStack justify="space-between" align="center" marginBottom={1}>
            <Text fontSize="sm" fontWeight="bold">Progress:</Text>
            <Badge
              colorScheme={quizSet.finished ? "green" : (quizSet.progress > 0 ? "yellow" : "gray")}
            >
              {quizSet.finished ? 'FINISHED' : (quizSet.progress > 0 ? 'IN PROGRESS' : 'NOT STARTED')}
            </Badge>
          </HStack>
          <Box position="relative">
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
              fontSize="xs"
              fontWeight="bold"
              color="white"
            >
              {quizSet.finished ? '100%' : `${quizSet.progress}%`}
            </Text>
          </Box>
        </Box>
  
        <HStack justify="space-between" align="center">
          <Text fontSize="sm" fontWeight="bold">Latest Grade:</Text>
          {quizSet.attempts === 0 || quizSet.latest_score === null ? (
            <Text fontSize="sm">NOT ATTEMPTED</Text>
          ) : (
            <HStack spacing={2} align="center">
              <Badge colorScheme={quizSet.latest_score / quizSet.total_questions >= 0.7 ? "green" : "red"}>
                {quizSet.latest_score / quizSet.total_questions >= 0.7 ? "PASS" : "FAIL"}
              </Badge>
              <Text fontSize="sm">{quizSet.latest_score}/{quizSet.total_questions}</Text>
              <Text fontSize="sm">({Math.round((quizSet.latest_score / quizSet.total_questions) * 100)}%)</Text>
            </HStack>
          )}
        </HStack>
  
        <HStack justify="space-between" align="center">
          <Text fontSize="sm" fontWeight="bold">Updated:</Text>
          <Text fontSize="sm">{formatRelativeTime(quizSet.last_updated)}</Text>
        </HStack>
      </VStack>
    </Box>
  ), [
    checkedItems,
    editingTitleId,
    editingTitle,
    handleChildCheckboxChange,
    handleOpenUrlsModal,
    handleEditStart,
    onOpenDeleteAlert,
    handleEditChange,
    handleRename,
    handleKeyPress,
    formatRelativeTime,
    useColorModeValue
  ]);

  return (
    <Box
      width={['95%', '90%', '80%']}
      marginX="auto"
      marginTop={5}
      border="1px"
      borderColor={borderColor}
      borderRadius="md"
      overflow="hidden"
    >
      {isLoading ? (
        <QuizTableSkeleton quizSetCount={quizSetCount} />
      ) : sortedQuizSets.length === 0 ? (
        <Box padding={4} textAlign="center">
          <Text fontSize="xl" fontWeight="bold">No quiz sets available.</Text>
          <Text marginTop={2}>Please add a new quiz set to get started.</Text>
        </Box>
      ) : (
        <>
          <Flex justifyContent="space-between" padding={4}>
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
            <VStack spacing={4} align="stretch" paddingX={4}>
              {sortedQuizSets.map(renderMobileCard)}
            </VStack>
          ) : (
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
                  <Th textAlign="center">Attempts</Th>
                  <Th textAlign="center">Progress</Th>
                  <Th textAlign="center">Latest Grade</Th>
                  <Th>
                    <Flex alignItems="center" justifyContent="center">
                      <Text marginRight={2}>Updated</Text>
                      <Icon
                        as={sortOrder === 'asc' ? GoSortAsc : GoSortDesc}
                        onClick={toggleSortOrder}
                        cursor="pointer"
                      />
                    </Flex>
                  </Th>
                  <Th textAlign="center">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sortedQuizSets.map(renderQuizSetRow)}
              </Tbody>
            </Table>
          )}
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
              <Button colorScheme="red" onClick={handleDeleteQuizSet} marginLeft={3}>
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
              <Button colorScheme="red" onClick={handleDeleteMultipleQuizSets} marginLeft={3}>
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
              <Button colorScheme="red" onClick={handleDeleteAllQuizSets} marginLeft={3}>
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