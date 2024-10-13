// pages/index.tsx

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Text, 
  Center, 
  VStack, 
  Button, 
  Divider, 
  useColorModeValue, 
  Stack, 
  Flex, 
  Link as ChakraLink 
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { ChevronRightIcon } from '@chakra-ui/icons';
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
      <Flex flexDirection="column" minHeight="100vh">
        <Navbar />
        <VStack spacing={[2, 4, 6]} mt={[5, 10]} align="stretch" flex={1}>
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
              {!isLoggedIn && (
                <>
                  <Button
                    onClick={() => router.push('/signin')}
                    variant="outline"
                    color={useColorModeValue('black', 'white')}
                    borderColor={useColorModeValue('black', 'white')}
                    _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                  >
                    Sign In
                  </Button>

                  <Button
                    onClick={handleDashboardClick}
                    bg={useColorModeValue('black', 'white')}
                    color={useColorModeValue('white', 'black')}
                    _hover={{ bg: useColorModeValue('gray.700', 'gray.300') }}
                    rightIcon={<ChevronRightIcon />}
                  >
                    Go to Dashboard
                  </Button>

                  <Button
                    onClick={() => router.push('/signup')}
                    variant="outline"
                    color={useColorModeValue('black', 'white')}
                    borderColor={useColorModeValue('black', 'white')}
                    _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                  >
                    Sign Up
                  </Button>
                </>
              )}

              {isLoggedIn && (
                <Button
                  onClick={handleDashboardClick}
                  bg={useColorModeValue('black', 'white')}
                  color={useColorModeValue('white', 'black')}
                  _hover={{ bg: useColorModeValue('gray.700', 'gray.300') }}
                  rightIcon={<ChevronRightIcon />}
                >
                  Go to Dashboard
                </Button>
              )}
            </Stack>
          </Center>
        </VStack>
        
        {/* Updated Footer */}
        <Flex 
          as="footer" 
          w="full" 
          py={4} 
          borderTop={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          justifyContent="center" 
          alignItems="center"
        >
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
      </Flex>
    </LoadingLayout>
  );
}
