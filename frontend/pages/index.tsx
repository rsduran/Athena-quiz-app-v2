// pages/index.tsx

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Text, 
  VStack, 
  Button, 
  useColorModeValue, 
  Stack, 
  Flex,
  Container,
  SimpleGrid,
  Icon,
  Link as ChakraLink,
  useColorMode
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { ArrowRight, BookOpen, Globe, Zap } from "lucide-react";
import Navbar from '../components/Navbar';
import LoadingLayout from '../components/LoadingLayout';
import { getBackendUrl } from '../utils/getBackendUrl';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionVStack = motion(VStack);
const MotionSimpleGrid = motion(SimpleGrid);

const FadeInWhenVisible = ({ children }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    rootMargin: '-100px 0px',
  });

  return (
    <MotionBox
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </MotionBox>
  );
};

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { colorMode } = useColorMode();

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

  const gradientLight = "linear-gradient(to right, #8B5CF6, #EC4899, #EF4444)";
  const gradientDark = "linear-gradient(to right, #4C1D95, #831843, #991B1B)";

  return (
    <LoadingLayout>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>
      <style jsx global>{`
        .dm-sans * {
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>
      <Flex flexDirection="column" minHeight="100vh" className="dm-sans">
        <Navbar />
        <MotionBox 
          width="100%" 
          paddingY={["48px", "96px", "128px", "192px"]} 
          backgroundImage={useColorModeValue(gradientLight, gradientDark)}
          transition="background-image 0.5s ease-in-out"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Container maxWidth="container.xl">
            <MotionVStack spacing={6} align="center" color="white" initial={{ y: 50 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}>
              <VStack spacing={2}>
                <Text
                  fontSize={['3xl', '4xl', '5xl', '6xl']}
                  fontWeight="bold"
                  textAlign="center"
                  lineHeight="1.2"
                >
                  Ace the PH ECE Board Exam
                </Text>
              </VStack>
              <Text
                fontSize={['lg', 'xl']}
                textAlign="center"
                maxWidth="700px"
              >
                Streamline your ECE board exam prep with multi-source quizzes. Open to all electronics enthusiasts worldwide!
              </Text>
              <Stack direction={['column', 'row']} spacing={4}>
                {!isLoggedIn && (
                  <>
                    <Button
                      onClick={() => router.push('/signin')}
                      variant="outline"
                      color="white"
                      borderColor="white"
                      _hover={{ backgroundColor: 'whiteAlpha.200' }}
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => router.push('/signup')}
                      variant="outline"
                      color="white"
                      borderColor="white"
                      _hover={{ backgroundColor: 'whiteAlpha.200' }}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
                <Button
                  onClick={handleDashboardClick}
                  backgroundColor="white"
                  color={useColorModeValue("purple.500", "purple.700")}
                  _hover={{ backgroundColor: useColorModeValue("gray.100", "gray.700") }}
                  rightIcon={<ArrowRight />}
                >
                  {isLoggedIn ? 'Go to Dashboard' : 'Start Preparing Now'}
                </Button>
              </Stack>
            </MotionVStack>
          </Container>
        </MotionBox>

        <FadeInWhenVisible>
          <Box paddingY={["48px", "96px", "128px"]} backgroundColor={useColorModeValue("gray.50", "gray.900")}>
            <Container maxWidth="container.xl">
              <MotionFlex direction={['column', 'row']} align="center" justify="space-between">
                <Box flex="1" marginBottom={[8, 0]}>
                  <Text fontSize={['3xl', '4xl', '5xl']} fontWeight="bold" marginBottom={4} color={useColorModeValue("gray.800", "white")}>
                    Meet Athena
                  </Text>
                  <Text fontSize={['lg', 'xl']} color={useColorModeValue("gray.600", "gray.300")}>
                    Your intelligent review buddy, designed to adapt to your learning style and help you excel in your ECE
                    board exam preparation.
                  </Text>
                </Box>
                <Box flex="1" display="flex" justifyContent="center">
                  <Icon as={BookOpen} boxSize={48} color={useColorModeValue("purple.500", "purple.300")} />
                </Box>
              </MotionFlex>
            </Container>
          </Box>
        </FadeInWhenVisible>

        <FadeInWhenVisible>
          <Box paddingY={["48px", "96px", "128px"]} backgroundColor={useColorModeValue("white", "gray.800")}>
            <Container maxWidth="container.xl">
              <Text fontSize={['3xl', '4xl', '5xl']} fontWeight="bold" textAlign="center" marginBottom={12} color={useColorModeValue("gray.800", "white")}>
                Why Choose Athena?
              </Text>
              <MotionSimpleGrid columns={[1, null, 3]} spacing={10}>
                {[
                  { icon: Zap, title: 'Multi-Source Quizzes', description: 'Access a wide range of questions from various reputable sources to ensure comprehensive preparation.' },
                  { icon: Globe, title: 'Global Access', description: 'Open to electronics enthusiasts worldwide, fostering a diverse learning community.' },
                  { icon: BookOpen, title: 'Personalized Learning', description: 'Athena adapts to your progress, focusing on areas that need improvement for efficient studying.' },
                ].map((feature, index) => (
                  <VStack key={index} align="center" textAlign="center">
                    <Icon as={feature.icon} boxSize={12} color={useColorModeValue("purple.500", "purple.300")} marginBottom={4} />
                    <Text fontSize="xl" fontWeight="bold" marginBottom={2} color={useColorModeValue("gray.800", "white")}>{feature.title}</Text>
                    <Text color={useColorModeValue("gray.600", "gray.300")}>{feature.description}</Text>
                  </VStack>
                ))}
              </MotionSimpleGrid>
            </Container>
          </Box>
        </FadeInWhenVisible>

        <Flex 
          as="footer" 
          width="100%" 
          paddingY={4} 
          borderTop={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          justifyContent="center" 
          alignItems="center"
          backgroundColor={useColorModeValue("white", "gray.800")}
        >
          <Text
            fontSize="sm"
            textAlign="center"
            color={useColorModeValue('gray.600', 'gray.300')}
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