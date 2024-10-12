// pages/signin.tsx

import React from 'react';
import { Box, Button, VStack, Text, useColorModeValue } from '@chakra-ui/react';
import { FaGithub } from 'react-icons/fa';
import { getBackendUrl } from '../utils/getBackendUrl';

export default function SignIn() {
  const handleGitHubAuth = () => {
    const backendUrl = getBackendUrl();
    console.log(`[DEBUG] Initiating GitHub auth. Backend URL: ${backendUrl}`);
    window.location.href = `${backendUrl}/auth/github`;
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
      <VStack spacing={4}>
        <Text fontSize="2xl" fontWeight="bold">
          Sign In
        </Text>
        <Button
          leftIcon={<FaGithub />}
          onClick={handleGitHubAuth}
          bg={useColorModeValue('black', 'white')}
          color={useColorModeValue('white', 'black')}
          _hover={{ bg: useColorModeValue('gray.700', 'gray.300') }}
        >
          Continue with GitHub
        </Button>
      </VStack>
    </Box>
  );
}