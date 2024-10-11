import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useToast, useColorMode, useColorModeValue, useDisclosure, useBreakpointValue } from '@chakra-ui/react';
import { getBackendUrl } from '@/utils/getBackendUrl';
import { Question } from '@/utils/types';

interface QuestionData {
  id: number;
  order: number;
  text: string;
  options: string[];
  answer: string;
  url: string;
  explanation: string;
  discussion_link: string;
  userSelectedOption: string | null;
  hasMathContent: boolean;
}

const useQuizState = () => {
  const backendUrl = getBackendUrl();
  const router = useRouter();
  const { id } = router.query;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isUnansweredQuestionsModalOpen, setIsUnansweredQuestionsModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [unansweredQuestions, setUnansweredQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState<number>(0);
  const [showFlipCard, setShowFlipCard] = useState(true);
  const [eyeIcon, setEyeIcon] = useState('open');
  const [eyeIconState, setEyeIconState] = useState<boolean>(true);
  const toast = useToast();
  const [shuffle, setShuffle] = useState(false);
  const [optionsShuffled, setOptionsShuffled] = useState(false);
  const [preserveShuffleState, setPreserveShuffleState] = useState({
    questionsShuffled: false,
    optionsShuffled: false
  });
  const iconButtonSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const flexWrapValue = useBreakpointValue({ base: 'wrap', md: 'nowrap' });

  const { colorMode, toggleColorMode } = useColorMode();
  const iconBg = useColorModeValue('white', 'transparent');
  const iconHoverBg = useColorModeValue('#edf2f8', '#2c323d');
  const cardBgColor = useColorModeValue('gray.50', 'gray.700');
  const cardTextColor = useColorModeValue('black', 'white');

  const { isOpen: isSearchModalOpen, onOpen: onSearchModalOpen, onClose: onSearchModalClose } = useDisclosure();
  const { isOpen: isConfirmationModalOpen, onOpen: onConfirmationModalOpen, onClose: onConfirmationModalClose } = useDisclosure();
  const { isOpen: isResetModalOpen, onOpen: onResetModalOpen, onClose: onResetModalClose } = useDisclosure();

  const shuffleArray = <T,>(array: T[]): void => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const shuffleOptionsAndUpdateAnswer = (questions: Question[]): Question[] => {
    console.log("Shuffling options for each question");
    return questions.map((question: Question) => {
      console.log('Original question:', question);

      const options = question.options.slice();
      const correctAnswerContent = question.options.find(
        (opt, idx) => `Option ${String.fromCharCode(65 + idx)}` === question.answer
      );

      shuffleArray(options);

      const newCorrectAnswerIndex = options.findIndex(opt => opt === correctAnswerContent);
      const newAnswerLabel = `Option ${String.fromCharCode(65 + newCorrectAnswerIndex)}`;

      const updatedQuestion: Question = {
        ...question,
        options,
        answer: newAnswerLabel,
      };

      console.log('Updated question:', updatedQuestion);

      return updatedQuestion;
    });
  };

  const handleToggleShuffleOptions = () => {
    console.log("Toggling shuffle options from", optionsShuffled);

    const newOptionsShuffledState = !optionsShuffled;
    setOptionsShuffled(newOptionsShuffledState);

    console.log("Options shuffled state changed to", newOptionsShuffledState);

    setQuestions((currentQuestions) => {
      const questionsCopy = JSON.parse(JSON.stringify(currentQuestions));

      if (newOptionsShuffledState) {
        const newQuestions = shuffleOptionsAndUpdateAnswer(questionsCopy);
        console.log("Questions after shuffling options", newQuestions);
        return newQuestions;
      } else {
        const newQuestions = questionsCopy.map((question: Question) => {
          return {
            ...question,
            options: question.originalOptions?.slice() || question.options.slice(),
          };
        });
        console.log("Questions after restoring original options", newQuestions);
        return newQuestions;
      }
    });

    setPreserveShuffleState((prevState) => ({
      ...prevState,
      optionsShuffled: newOptionsShuffledState,
    }));
  };

  const confirmShuffleQuestions = async () => {
    console.log("Confirming shuffle questions...");
    try {
      console.log("Before fetching shuffled questions");
      const shuffledResponse = await fetch(`${backendUrl}/shuffleQuestions/${id}`, { method: 'POST' });
      if (!shuffledResponse.ok) throw new Error('Error shuffling questions');

      let shuffledQuestionsData = await shuffledResponse.json();
      console.log("Shuffled questions received:", shuffledQuestionsData);

      let shuffledQuestions: Question[] = shuffledQuestionsData.map((q: QuestionData) => ({
        id: q.id,
        order: q.order,
        question: q.text,
        options: q.options,
        answer: q.answer,
        url: q.url,
        explanation: q.explanation,
        discussion_link: q.discussion_link,
        hasMathContent: q.hasMathContent,
        userSelectedOption: null,
      }));

      if (optionsShuffled) {
        console.log("Reapplying options shuffle after questions shuffle");
        shuffledQuestions = shuffleOptionsAndUpdateAnswer(shuffledQuestions);
      }

      console.log("Setting preserve shuffle state");
      setPreserveShuffleState({
        questionsShuffled: true,
        optionsShuffled,
      });

      setQuestions(shuffledQuestions);
      console.log("Questions state updated after shuffle");

      console.log("Resetting current question index to 0");
      setCurrentQuestionIndex(0);
      onConfirmationModalClose();

      toast({
        title: "Questions Shuffled",
        description: "Questions have been shuffled.",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });
    } catch (error) {
      console.error('Error shuffling questions:', error);
    }
  };

  const handleFlipCard = () => {
    setIsCardFlipped(prev => !prev);
  };

  const fetchUserSelections = async () => {
    try {
      const response = await fetch(`${backendUrl}/getUserSelections/${id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const selections = await response.json();
      setQuestions(prevQuestions => prevQuestions.map(q => ({
        ...q,
        userSelectedOption: selections[q.id] || null
      })));
    } catch (error) {
      console.error('Error fetching user selections:', error);
    }
  };

  const fetchQuestionsAndUpdateSelections = async () => {
    console.log("Fetching questions...");
    try {
      const response = await fetch(`${backendUrl}/getQuestionsByQuizSet/${id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      let data = await response.json();

      console.log("Fetched Questions Data:", data);

      let mappedQuestions: Question[] = data.map((q: QuestionData) => ({
        id: q.id,
        order: q.order,
        question: q.text,
        options: q.options.slice(),
        originalOptions: q.options.slice(),
        answer: q.answer,
        url: q.url,
        explanation: q.explanation,
        discussion_link: q.discussion_link,
        hasMathContent: q.hasMathContent,
        userSelectedOption: null,
      }));

      mappedQuestions.sort((a: Question, b: Question) => a.order - b.order);

      setQuestions(mappedQuestions);
      await fetchUserSelections();
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const fetchEyeIconState = useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(`${backendUrl}/getEyeIconState/${id}`);
      if (!response.ok) throw new Error('Failed to fetch eye icon state');
      const data = await response.json();
      setEyeIconState(data.state);
      setShowFlipCard(data.state);
    } catch (error) {
      console.error('Error fetching eye icon state:', error);
    }
  }, [id, backendUrl]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`${backendUrl}/getFavorites/${id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const favoritedQuestions = await response.json();
      setFavorites(new Set(favoritedQuestions.map((q: { id: number }) => q.id)));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleToggleFavorites = (questionId: number) => {
    fetch(`${backendUrl}/toggleFavorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: questionId })
    })
      .then(response => response.json())
      .then(() => {
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          let message = "";
          if (newFavorites.has(questionId)) {
            newFavorites.delete(questionId);
            message = "Removed from Favorites";
          } else {
            newFavorites.add(questionId);
            message = "Added to Favorites";
          }
          toast({
            title: message,
            status: "info",
            duration: 3000,
            isClosable: true,
            position: "bottom-right"
          });
          return newFavorites;
        });
      })
      .then(() => {
        if (selectedFilter === 'favorites') {
          setFilteredQuestions(questions.filter(question => favorites.has(question.id)));
        }
      })
      .catch(error => console.error('Error toggling favorite:', error));
  };

  const handleDropdownChange = (value: string) => {
    setSelectedFilter(value);
    setCurrentQuestionIndex(0);
  };

  const handleOptionSelect = async (optionIndex: number | null) => {
    const questionId = filteredQuestions[currentQuestionIndex].id;
    const currentQuestion = questions.find(q => q.id === questionId);

    if (!currentQuestion) {
      console.error("Question not found");
      return;
    }

    const previouslySelectedOptionIndex = currentQuestion.options.findIndex(opt => opt === currentQuestion.userSelectedOption);

    let selectedOption: string | null = null;
    if (optionIndex !== null) {
      selectedOption = `Option ${String.fromCharCode(65 + optionIndex)}`;
    }

    const isCorrect = selectedOption === currentQuestion.answer;

    if (selectedOption && previouslySelectedOptionIndex !== optionIndex) {
      const increment = isCorrect ? 1 : 0;
      await updateScore(questionId, increment);
    } else if (!selectedOption && previouslySelectedOptionIndex !== null) {
      const decrement = currentQuestion.options[previouslySelectedOptionIndex] === currentQuestion.answer ? -1 : 0;
      await updateScore(questionId, decrement);
    }

    await fetch(`${backendUrl}/updateUserSelection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: questionId, selected_option: selectedOption })
    });

    setQuestions(prevQuestions => prevQuestions.map(q => {
      if (q.id === questionId) {
        return { ...q, userSelectedOption: selectedOption };
      }
      return q;
    }));
  };

  const updateScore = async (questionId: number, scoreChange: number) => {
    await fetch(`${backendUrl}/updateScore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: questionId, increment: scoreChange, quiz_set_id: id })
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const onNavigateToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    onSearchModalClose();
  };

  const handleSubmit = () => {
    const unansweredQuestions = questions.filter(q => q.userSelectedOption === null);

    if (unansweredQuestions.length > 0) {
      setUnansweredQuestions(unansweredQuestions);
      setIsUnansweredQuestionsModalOpen(true);
    } else {
      calculateAndShowSummary();
    }
  };

  const calculateAndShowSummary = () => {
    const calculatedScore = questions.reduce((acc, question) => {
      const correct = question.userSelectedOption === question.answer;
      return acc + (correct ? 1 : 0);
    }, 0);

    console.log(`Calculated Score: ${calculatedScore}`);
    setScore(calculatedScore);
    updateScoreInDatabase(calculatedScore);

    const passingScore = 70;
    const newStatus = calculatedScore / questions.length >= passingScore / 100 ? 'Passed' : 'Failed';
    updateQuizSetStatus(newStatus);
    setIsSummaryModalOpen(true);
  };

  const updateQuizSetStatus = async (status: string) => {
    try {
      await fetch(`${backendUrl}/updateQuizSetStatus/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('Error updating quiz set status:', error);
    }
  };

  const updateScoreInDatabase = (score: number) => {
    fetch(`${backendUrl}/updateQuizSetScore/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score })
    })
      .then(response => response.json())
      .then(data => console.log('Score updated in database:', data))
      .catch(error => console.error('Error updating score:', error));
  };

  const onSubmitWithUnanswered = () => {
    setIsUnansweredQuestionsModalOpen(false);
    calculateAndShowSummary();
  };

  const navigateToIncorrect = () => {
    setSelectedFilter('incorrect');
    setCurrentQuestionIndex(0);
    setIsSummaryModalOpen(false);
  };

  const getQuestionIndex = (questionId: number, filter: string) => {
    let list;
    switch (filter) {
      case 'favorites':
        list = questions.filter(q => favorites.has(q.id));
        break;
      case 'answered':
        list = questions.filter(q => q.userSelectedOption !== null);
        break;
      case 'unanswered':
        list = questions.filter(q => q.userSelectedOption === null);
        break;
      case 'incorrect':
        list = questions.filter(q => q.userSelectedOption !== q.answer);
        break;
      default:
        list = [...questions];
    }
    list.sort((a: Question, b: Question) => a.order - b.order);
    return list.findIndex(q => q.id === questionId);
  };

  const handleReset = async () => {
    console.log("Initiating reset");
    try {
      const response = await fetch(`${backendUrl}/resetQuestions/${id}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Network response was not ok');

      console.log("Reset successful, refetching questions");
      await fetchQuestionsAndUpdateSelections();

      setCurrentQuestionIndex(0);

      onResetModalClose();

      toast({
        title: "Questions Reset",
        description: "All questions and answers have been reset.",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "bottom-right"
      });
    } catch (error) {
      console.error('Error resetting questions:', error);
    }
  };

  const toggleFlipCardVisibility = useCallback(async () => {
    if (!id) return;
    const newState = !eyeIconState;
    try {
      const response = await fetch(`${backendUrl}/updateEyeIconState/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newState })
      });
      if (!response.ok) throw new Error('Failed to update eye icon state');
      setEyeIconState(newState);
      setShowFlipCard(newState);
      setIsCardFlipped(false);
    } catch (error) {
      console.error('Error updating eye icon state:', error);
    }
  }, [id, backendUrl, eyeIconState]);

  const handleNavigate = (action: string, value?: number) => {
    setIsCardFlipped(false);

    let newIndex = currentQuestionIndex;
    switch (action) {
      case 'prev':
        newIndex = Math.max(currentQuestionIndex - 1, 0);
        break;
      case 'next':
        newIndex = Math.min(currentQuestionIndex + 1, filteredQuestions.length - 1);
        break;
      case 'goto':
        newIndex = value ? value - 1 : currentQuestionIndex;
        break;
      case 'reset':
        setCurrentQuestionIndex(0);
        return;
    }
    if (newIndex >= 0 && newIndex < filteredQuestions.length) {
      if (newIndex !== currentQuestionIndex) {
        setIsCardFlipped(false);
      }
      setCurrentQuestionIndex(newIndex);
    }
  };

  const submitQuiz = async () => {
    // Calculate the score
    const correctAnswers = questions.filter(q => q.userSelectedOption === q.answer).length;
    const totalQuestions = questions.length;
    const score = correctAnswers;

    // Send the score to the backend
    try {
      await fetch(`${backendUrl}/updateQuizSetScore/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score }),
      });

      // Optionally, fetch updated quiz sets to refresh data
      // You can call fetchQuizSets() here if you have access to it
      console.log('Score submitted successfully');
    } catch (error) {
      console.error('Error updating quiz set score:', error);
    }
  };

  useEffect(() => {
    fetchEyeIconState();
  }, [fetchEyeIconState]);

  useEffect(() => {
    if (id) {
      fetchQuestionsAndUpdateSelections();
      fetchFavorites();
    }
  }, [id]);

  useEffect(() => {
    const answeredQuestions = questions.filter(q => q.userSelectedOption !== null);
    const unansweredQuestions = questions.filter(q => q.userSelectedOption === null);
    switch (selectedFilter) {
      case 'favorites':
        setFilteredQuestions(questions.filter(question => favorites.has(question.id)));
        break;
      case 'answered':
        setFilteredQuestions(answeredQuestions);
        break;
      case 'unanswered':
        setFilteredQuestions(unansweredQuestions);
        break;
      default:
        setFilteredQuestions(questions);
    }
  }, [questions, favorites, selectedFilter]);

  useEffect(() => {
    let filtered;
    switch (selectedFilter) {
      case 'favorites':
        filtered = questions.filter(question => favorites.has(question.id));
        break;
      case 'answered':
        filtered = questions.filter(q => q.userSelectedOption !== null);
        break;
      case 'unanswered':
        filtered = questions.filter(q => q.userSelectedOption === null);
        break;
      case 'incorrect':
        filtered = questions.filter(q => q.userSelectedOption !== q.answer);
        break;
      default:
        filtered = [...questions];
    }
    filtered.sort((a: Question, b: Question) => a.order - b.order);
    setFilteredQuestions(filtered);
  }, [questions, favorites, selectedFilter]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') {
        return;
      }

      switch (event.key) {
        case ' ':
          event.preventDefault();
          handleFlipCard();
          break;
        case 'ArrowLeft':
          handleNavigate('prev');
          break;
        case 'ArrowRight':
          handleNavigate('next');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentQuestionIndex, filteredQuestions.length, isCardFlipped]);

  return {
    state: {
      questions,
      filteredQuestions,
      currentQuestionIndex,
      isCardFlipped,
      favorites,
      selectedFilter,
      searchKeyword,
      isUnansweredQuestionsModalOpen,
      isSummaryModalOpen,
      unansweredQuestions,
      score,
      showFlipCard,
      eyeIcon,
      eyeIconState,
      optionsShuffled,
      preserveShuffleState,
      colorMode,
      iconBg,
      iconHoverBg,
      iconButtonSize,
      flexWrapValue,
      cardBgColor,
      cardTextColor,
      isSearchModalOpen,
      isConfirmationModalOpen,
      isResetModalOpen,
    },
    actions: {
      getQuestionIndex,
      setQuestions,
      setFilteredQuestions,
      setCurrentQuestionIndex,
      setIsCardFlipped,
      setFavorites,
      setSelectedFilter,
      setSearchKeyword,
      setIsUnansweredQuestionsModalOpen,
      setIsSummaryModalOpen,
      setUnansweredQuestions,
      setScore,
      setShowFlipCard,
      setEyeIcon,
      setEyeIconState,
      setOptionsShuffled,
      setPreserveShuffleState,
      submitQuiz,
      toggleColorMode,
      onSearchModalOpen,
      onSearchModalClose,
      onConfirmationModalOpen,
      onConfirmationModalClose,
      onResetModalOpen,
      onResetModalClose,
      handleToggleShuffleOptions,
      confirmShuffleQuestions,
      handleFlipCard,
      fetchUserSelections,
      fetchQuestionsAndUpdateSelections,
      fetchEyeIconState,
      fetchFavorites,
      handleToggleFavorites,
      handleDropdownChange,
      handleOptionSelect,
      handleSearchChange,
      onNavigateToQuestion,
      handleSubmit,
      calculateAndShowSummary,
      onSubmitWithUnanswered,
      navigateToIncorrect,
      handleReset,
      toggleFlipCardVisibility,
      handleNavigate,
    },
  };
};

export default useQuizState;