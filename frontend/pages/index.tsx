// pages/index.tsx

import React, { useEffect, useState } from 'react';
import { Box, Text, Center, VStack, Button, Divider, useColorModeValue, Stack, Flex, Link as ChakraLink } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import LoadingLayout from '../components/LoadingLayout';
import { getBackendUrl } from '../utils/getBackendUrl';

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const backendUrl = getBackendUrl();
      try {
        const response = await fetch(`${backendUrl}/auth/status`, {
          credentials: 'include'
        });
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn);
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };
    checkLoginStatus();
  }, []);

  const handleDashboardClick = () => {
    if (isLoggedIn) {
      router.push('/Dashboard');
    } else {
      router.push('/signin');
    }
  };

  return (
    <LoadingLayout>
      <>
        <Navbar />
        <VStack spacing={[2, 4, 6]} mt={[5, 10]} align="stretch" minHeight="calc(100vh - 64px)">
          <Center>
            <VStack spacing={0}>
              <Text
                fontSize={['2xl', '3xl', '4xl', '5xl']}
                fontWeight="bold"
                color={useColorModeValue('gray.800', 'white')}
                m={0}
                textAlign="center"
              >
                Discover, simplify, excel.
              </Text>
              <Text
                fontSize={['2xl', '3xl', '4xl', '5xl']}
                fontWeight="bold"
                color={useColorModeValue('gray.800', 'white')}
                m={0}
                textAlign="center"
              >
                With athena by your side.
              </Text>
            </VStack>
          </Center>
          <Center>
            <Text
              fontSize={['lg', 'xl', '2xl']}
              fontWeight="bold"
              color={useColorModeValue('gray.600', 'gray.200')}
              textAlign="center"
            >
              Streamlined quizzes from multiple sources, for effortless bulk answering.
            </Text>
          </Center>
          <Divider my={[2, 4]} w={['80%', '70%', '60%', '50%']} alignSelf="center" />

          <Center>
            <Stack direction={['column', 'row']} spacing={3} align="center">
              <Button
                onClick={handleDashboardClick}
                bg={useColorModeValue('black', 'white')}
                color={useColorModeValue('white', 'black')}
                _hover={{ bg: useColorModeValue('gray.700', 'gray.300') }}
              >
                Go to Dashboard
              </Button>
              {!isLoggedIn && (
                <>
                  <Button
                    onClick={() => router.push('/signin')}
                    bg={useColorModeValue('black', 'white')}
                    color={useColorModeValue('white', 'black')}
                    _hover={{ bg: useColorModeValue('gray.700', 'gray.300') }}
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => router.push('/signup')}
                    bg={useColorModeValue('black', 'white')}
                    color={useColorModeValue('white', 'black')}
                    _hover={{ bg: useColorModeValue('gray.700', 'gray.300') }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Stack>
          </Center>
          
          <Flex flex={1} />

          {/* Footer */}
          <Divider my={[2, 4]} />
          <Flex as="footer" w="full" py={2} alignItems="center" justifyContent="center">
            <Text
              fontSize="sm"
              textAlign="center"
              color={useColorModeValue('gray.600', 'gray.200')}
            >
              Built by{' '}
              <ChakraLink
                href="https://github.com/rsduran"
                isExternal
                textDecoration="underline"
                color={useColorModeValue('black', 'white')}
              >
                rsduran
              </ChakraLink>
              . The source code is available on{' '}
              <ChakraLink
                href="https://github.com/rsduran/athena-cli"
                isExternal
                textDecoration="underline"
                color={useColorModeValue('black', 'white')}
              >
                GitHub
              </ChakraLink>
              .
            </Text>
          </Flex>
        </VStack>
      </>
    </LoadingLayout>
  );
}