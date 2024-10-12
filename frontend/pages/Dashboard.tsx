// Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardNavbar from '../components/DashboardNavbar';
import { Box, Flex, useBreakpointValue, Spinner, Center } from '@chakra-ui/react';
import LoadingLayout from '../components/LoadingLayout';
import CalendarEditor from '../components/CalendarEditor';
import DynamicQuizTable from '../components/DynamicQuizTable';
import CountdownTimer from '../components/CountdownTimer';
import MotivationalQuote from '../components/MotivationalQuote';
import { getBackendUrl } from '../utils/getBackendUrl';

const Dashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const backendUrl = getBackendUrl();
      try {
        const response = await fetch(`${backendUrl}/auth/status`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (!data.isLoggedIn) {
          router.push('/signin');
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        router.push('/signin');
      }
    };

    checkAuth();
  }, [router]);

  const handleAddNewQuizSet = () => {
    setRefreshKey((oldKey) => oldKey + 1);
  };

  const flexDirection = useBreakpointValue<'column' | 'row'>({
    base: 'column',
    md: 'row',
  }) || 'column';

  if (isLoading) {
    return (
      <LoadingLayout>
        <Center height="100vh">
          <Spinner size="xl" />
        </Center>
      </LoadingLayout>
    );
  }

  return (
    <LoadingLayout>
      <Box>
        <DashboardNavbar onAddNewQuizSet={handleAddNewQuizSet} />
        <CalendarEditor />
        <DynamicQuizTable key={refreshKey} />

        <Flex
          justify="center"
          mt={['10px', '20px']}
          flexDirection={flexDirection}
          alignItems="center"
          mx="auto"
          px={[4, 8]}
          maxW="1200px"
          gap={4}
        >
          <Box flexBasis={['100%', '30%']} flexShrink={0}>
            <CountdownTimer />
          </Box>
          <Box flexBasis={['100%', '70%']} mt={['20px', 0]}>
            <MotivationalQuote />
          </Box>
        </Flex>
      </Box>
    </LoadingLayout>
  );
};

export default Dashboard;