// pages/signin.tsx

import React, { useState } from 'react';
import { Box, Button, VStack, Text, Input, InputGroup, InputRightElement, Divider, useColorModeValue, Link } from '@chakra-ui/react';
import { FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa';
import { getBackendUrl } from '../utils/getBackendUrl';

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);

  const handleGitHubAuth = () => {
    const backendUrl = getBackendUrl();
    console.log(`[DEBUG] Initiating GitHub auth. Backend URL: ${backendUrl}`);
    window.location.href = `${backendUrl}/auth/github`;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Box
        borderWidth="1px"
        borderRadius="lg"
        p={6}
        boxShadow="lg"
        bg={useColorModeValue('white', 'gray.700')}
        maxW="md"
        w="100%"
      >
        <VStack spacing={4} align="stretch">
          <Text fontSize="2xl" fontWeight="bold" textAlign="center">
            Sign In
          </Text>
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} textAlign="center">
            Enter your email and password to sign in to your account.
          </Text>
          <VStack spacing={3} align="stretch">
            <Box>
              <Text mb={1} fontSize="sm" fontWeight="medium">
                Email
              </Text>
              <Input id="email" type="email" placeholder="name@example.com" />
            </Box>
            <Box>
              <Text mb={1} fontSize="sm" fontWeight="medium">
                Password
              </Text>
              <InputGroup>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                />
                <InputRightElement>
                  <Button variant="ghost" onClick={togglePasswordVisibility}>
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Box>
          </VStack>
          <Button colorScheme="blue" size="lg" w="full">
            Sign In
          </Button>
          <Divider my={4} />
          <Button
            leftIcon={<FaGithub />}
            onClick={handleGitHubAuth}
            bg={useColorModeValue('black', 'gray.600')}
            color={useColorModeValue('white', 'white')}
            _hover={{ bg: useColorModeValue('gray.700', 'gray.500') }}
            size="lg"
            w="full"
            variant="solid"
          >
            Continue with GitHub
          </Button>
          <Text textAlign="center" fontSize="sm" mt={4} color={useColorModeValue('gray.600', 'gray.400')}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" color="blue.500" fontWeight="medium" textDecor="underline">
              Sign up
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}
